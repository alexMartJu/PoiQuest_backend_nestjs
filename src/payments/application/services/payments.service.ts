import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import Stripe from 'stripe';
import { randomUUID } from 'crypto';
import { PaymentsRepository } from '../../domain/repositories/payments.repository';
import { EventsRepository } from '../../../events/domain/repositories/events.repository';
import { ProfileRepository } from '../../../profile/domain/repositories/profile.repository';
import { TicketEntity, TicketStatus } from '../../domain/entities/ticket.entity';
import { PaymentEntity, PaymentStatus } from '../../domain/entities/payment.entity';
import { EventStatus } from '../../../events/domain/enums/event-status.enum';
import { CreatePaymentIntentDto } from '../dto/create-payment-intent.dto';
import { ConfirmFreeTicketsDto } from '../dto/confirm-free-tickets.dto';
import { NotFoundError } from '../../../shared/errors/not-found.error';
import { ValidationError } from '../../../shared/errors/validation.error';
import { ForbiddenError } from '../../../shared/errors/forbidden.error';

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe;

  constructor(
    private readonly paymentsRepo: PaymentsRepository,
    private readonly eventsRepo: EventsRepository,
    private readonly profileRepo: ProfileRepository,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY no configurada');
    }
    this.stripe = new Stripe(secretKey);
  }

  /// Crea un PaymentIntent en Stripe y tickets en estado PENDING_PAYMENT
  async createPaymentIntent(userId: number, dto: CreatePaymentIntentDto) {
    const profile = await this.profileRepo.findOneByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Perfil no encontrado', { userId });
    }

    const event = await this.eventsRepo.findOneByUuid(dto.eventUuid);
    if (!event) {
      throw new NotFoundError('Evento no encontrado', { uuid: dto.eventUuid });
    }
    if (event.status !== EventStatus.ACTIVE) {
      throw new ValidationError('Solo se pueden comprar tickets de eventos activos', { status: event.status });
    }

    // Validar que la fecha está dentro del rango del evento
    this.validateVisitDate(event.startDate, event.endDate, dto.visitDate);

    // Validar cantidad (1-4)
    if (dto.quantity < 1 || dto.quantity > 4) {
      throw new ValidationError('La cantidad debe ser entre 1 y 4 tickets', { quantity: dto.quantity });
    }

    // Validar límite de 4 tickets por usuario por evento en la misma fecha
    const existingCount = await this.paymentsRepo.countTicketsByProfileEventDate(
      profile.id, event.id, dto.visitDate,
    );
    if (existingCount + dto.quantity > 4) {
      throw new ValidationError(
        `Ya tienes ${existingCount} ticket(s) para este evento en esa fecha. Máximo 4 por persona.`,
        { existing: existingCount, requested: dto.quantity },
      );
    }

    // Validar capacidad del evento
    if (event.capacityPerDay != null) {
      const totalSold = await this.paymentsRepo.countTicketsByEventAndDate(event.id, dto.visitDate);
      if (totalSold + dto.quantity > event.capacityPerDay) {
        const available = event.capacityPerDay - totalSold;
        throw new ValidationError(
          `Solo quedan ${available} entrada(s) disponibles para esa fecha`,
          { available, requested: dto.quantity },
        );
      }
    }

    // El evento debe ser de pago
    const price = parseFloat(String(event.price ?? 0));
    if (price <= 0) {
      throw new ValidationError('Este evento es gratuito. Usa el endpoint de tickets gratuitos.', {});
    }

    const totalAmount = Math.round(price * dto.quantity * 100); // Stripe trabaja en centimos

    // Crear PaymentIntent en Stripe
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'eur',
      metadata: {
        eventUuid: dto.eventUuid,
        visitDate: dto.visitDate,
        quantity: String(dto.quantity),
        profileId: String(profile.id),
      },
    });

    // Crear tickets en transacción
    const tickets = await this.dataSource.transaction(async (manager) => {
      const createdTickets: TicketEntity[] = [];

      for (let i = 0; i < dto.quantity; i++) {
        const ticket = this.paymentsRepo.createTicket({
          profileId: profile.id,
          eventId: event.id,
          qrCode: randomUUID(),
          status: TicketStatus.PENDING_PAYMENT,
          visitDate: dto.visitDate,
        });
        const saved = await manager.save(ticket);

        // Crear registro de pago
        const payment = manager.create(PaymentEntity, {
          ticketId: saved.id,
          method: 'stripe',
          amount: price.toFixed(2),
          currency: 'EUR',
          status: PaymentStatus.PENDING,
          stripePaymentIntentId: paymentIntent.id,
        });
        await manager.save(payment);

        createdTickets.push(saved);
      }

      return createdTickets;
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      tickets: tickets.map(t => ({ uuid: t.uuid, qrCode: t.qrCode })),
    };
  }

  /// Confirma el pago exitoso y activa los tickets
  async confirmPayment(userId: number, paymentIntentId: string) {
    const profile = await this.profileRepo.findOneByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Perfil no encontrado', { userId });
    }

    // Verificar el estado del PaymentIntent en Stripe
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      throw new ValidationError('El pago no se ha completado correctamente', { status: paymentIntent.status });
    }

    // Verificar que los tickets pertenecen al perfil
    const metadata = paymentIntent.metadata;
    if (metadata.profileId !== String(profile.id)) {
      throw new ForbiddenError('No tienes permiso para confirmar este pago', {});
    }

    // Activar tickets asociados a este PaymentIntent
    await this.dataSource.transaction(async (manager) => {
      const payments = await manager.find(PaymentEntity, {
        where: { stripePaymentIntentId: paymentIntentId },
        relations: ['ticket'],
      });

      for (const payment of payments) {
        payment.status = PaymentStatus.PAID;
        await manager.save(payment);

        if (payment.ticket.status === TicketStatus.PENDING_PAYMENT) {
          payment.ticket.status = TicketStatus.ACTIVE;
          await manager.save(payment.ticket);
        }
      }
    });

    return { message: 'Pago confirmado y tickets activados' };
  }

  /// Crea tickets gratuitos (sin Stripe)
  async createFreeTickets(userId: number, dto: ConfirmFreeTicketsDto) {
    const profile = await this.profileRepo.findOneByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Perfil no encontrado', { userId });
    }

    const event = await this.eventsRepo.findOneByUuid(dto.eventUuid);
    if (!event) {
      throw new NotFoundError('Evento no encontrado', { uuid: dto.eventUuid });
    }
    if (event.status !== EventStatus.ACTIVE) {
      throw new ValidationError('Solo se pueden obtener tickets de eventos activos', { status: event.status });
    }

    // Validar que el evento es gratuito
    const price = event.price ?? 0;
    if (price > 0) {
      throw new ValidationError('Este evento no es gratuito. Usa el endpoint de pago.', {});
    }

    // Validar fecha dentro del rango
    this.validateVisitDate(event.startDate, event.endDate, dto.visitDate);

    // Validar cantidad (1-4)
    if (dto.quantity < 1 || dto.quantity > 4) {
      throw new ValidationError('La cantidad debe ser entre 1 y 4 tickets', { quantity: dto.quantity });
    }

    // Validar límite de 4 tickets
    const existingCount = await this.paymentsRepo.countTicketsByProfileEventDate(
      profile.id, event.id, dto.visitDate,
    );
    if (existingCount + dto.quantity > 4) {
      throw new ValidationError(
        `Ya tienes ${existingCount} ticket(s) para este evento en esa fecha. Máximo 4 por persona.`,
        { existing: existingCount, requested: dto.quantity },
      );
    }

    // Validar capacidad
    if (event.capacityPerDay != null) {
      const totalSold = await this.paymentsRepo.countTicketsByEventAndDate(event.id, dto.visitDate);
      if (totalSold + dto.quantity > event.capacityPerDay) {
        const available = event.capacityPerDay - totalSold;
        throw new ValidationError(
          `Solo quedan ${available} entrada(s) disponibles para esa fecha`,
          { available, requested: dto.quantity },
        );
      }
    }

    // Crear tickets directamente activos sin QR (gratuitos)
    const tickets = await this.dataSource.transaction(async (manager) => {
      const createdTickets: TicketEntity[] = [];

      for (let i = 0; i < dto.quantity; i++) {
        const ticket = this.paymentsRepo.createTicket({
          profileId: profile.id,
          eventId: event.id,
          qrCode: null, // Sin QR para eventos gratuitos
          status: TicketStatus.ACTIVE,
          visitDate: dto.visitDate,
        });
        const saved = await manager.save(ticket);
        createdTickets.push(saved);
      }

      return createdTickets;
    });

    return {
      tickets: tickets.map(t => ({ uuid: t.uuid })),
      message: 'Tickets gratuitos creados correctamente',
    };
  }

  /// Obtiene los tickets activos del usuario logueado
  async getActiveTickets(userId: number): Promise<TicketEntity[]> {
    const profile = await this.profileRepo.findOneByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Perfil no encontrado', { userId });
    }
    return this.paymentsRepo.findActiveTicketsByProfileId(profile.id);
  }

  /// Obtiene los tickets usados del usuario logueado
  async getUsedTickets(userId: number): Promise<TicketEntity[]> {
    const profile = await this.profileRepo.findOneByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Perfil no encontrado', { userId });
    }
    return this.paymentsRepo.findUsedTicketsByProfileId(profile.id);
  }

  /// Obtiene la disponibilidad de un evento para una fecha concreta
  async getEventAvailability(eventUuid: string, visitDate: string): Promise<{ capacity: number | null; sold: number; available: number | null }> {
    const event = await this.eventsRepo.findOneByUuid(eventUuid);
    if (!event) {
      throw new NotFoundError('Evento no encontrado', { uuid: eventUuid });
    }

    this.validateVisitDate(event.startDate, event.endDate, visitDate);

    const sold = await this.paymentsRepo.countTicketsByEventAndDate(event.id, visitDate);
    const capacity = event.capacityPerDay ?? null;
    const available = capacity !== null ? Math.max(capacity - sold, 0) : null;

    return { capacity, sold, available };
  }

  /// Marca como expirados los tickets ACTIVE cuya fecha de visita ya pasó.
  /// Usado por el scheduler diario.
  async markExpiredTickets(): Promise<number> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const tickets = await this.paymentsRepo.findActiveTicketsBeforeOrEqualDate(today);
    if (tickets.length === 0) return 0;
    const ids = tickets.map(t => t.id);
    await this.paymentsRepo.markTicketsAsExpired(ids);
    return ids.length;
  }

  // === Validaciones ===

  private validateVisitDate(startDate: string, endDate: string | null | undefined, visitDate: string): void {
    if (visitDate < startDate) {
      throw new ValidationError('La fecha de visita no puede ser anterior al inicio del evento', { visitDate, startDate });
    }
    if (endDate && visitDate > endDate) {
      throw new ValidationError('La fecha de visita no puede ser posterior al fin del evento', { visitDate, endDate });
    }
    // No permitir fechas pasadas
    const today = new Date().toISOString().split('T')[0];
    if (visitDate < today) {
      throw new ValidationError('No se pueden comprar tickets para fechas pasadas', { visitDate, today });
    }
  }
}
