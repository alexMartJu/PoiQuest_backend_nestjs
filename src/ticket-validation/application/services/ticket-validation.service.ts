import { Injectable } from '@nestjs/common';
import { TicketValidationRepository } from '../../domain/repositories/ticket-validation.repository';
import { PaymentsRepository } from '../../../payments/domain/repositories/payments.repository';
import { TicketEntity, TicketStatus } from '../../../payments/domain/entities/ticket.entity';
import { TicketValidationEntity } from '../../domain/entities/ticket-validation.entity';
import { ValidateTicketDto } from '../dto/validate-ticket.dto';
import { NotFoundError } from '../../../shared/errors/not-found.error';
import { ValidationError } from '../../../shared/errors/validation.error';

@Injectable()
export class TicketValidationService {
  constructor(
    private readonly validationRepo: TicketValidationRepository,
    private readonly paymentsRepo: PaymentsRepository,
  ) {}

  async validateTicket(
    validatorUserId: number,
    dto: ValidateTicketDto,
  ): Promise<{ validation: TicketValidationEntity; ticket: TicketEntity }> {
    const ticket = await this.paymentsRepo.findTicketByQrCode(dto.qrCode);

    if (!ticket) {
      throw new NotFoundError('Ticket no encontrado', { qrCode: dto.qrCode });
    }

    if (ticket.status !== TicketStatus.ACTIVE) {
      // Registrar escaneo inválido
      const failedRecord = this.validationRepo.create({
        ticketId: ticket.id,
        validatorId: validatorUserId,
        valid: false,
        reason: `Ticket no está activo (estado: ${ticket.status})`,
      });
      await this.validationRepo.save(failedRecord);

      throw new ValidationError(
        `Ticket no válido: estado actual "${ticket.status}"`,
        { status: ticket.status, qrCode: dto.qrCode },
      );
    }

    // Verificar que la fecha de visita del ticket sea hoy
    const today = new Date().toISOString().split('T')[0];
    if (ticket.visitDate !== today) {
      const failedRecord = this.validationRepo.create({
        ticketId: ticket.id,
        validatorId: validatorUserId,
        valid: false,
        reason: `Ticket para otra fecha (fecha de visita: ${ticket.visitDate})`,
      });
      await this.validationRepo.save(failedRecord);

      throw new ValidationError(
        `Ticket no válido: la fecha de visita es ${ticket.visitDate}, hoy es ${today}`,
        { visitDate: ticket.visitDate, today, qrCode: dto.qrCode },
      );
    }

    // Marcar ticket como usado
    await this.paymentsRepo.updateTicketStatus(ticket.id, TicketStatus.USED);

    // Registrar escaneo exitoso
    const record = this.validationRepo.create({
      ticketId: ticket.id,
      validatorId: validatorUserId,
      valid: true,
    });
    const saved = await this.validationRepo.save(record);

    return { validation: saved, ticket };
  }

  async getHistory(validatorUserId: number, date?: string): Promise<TicketValidationEntity[]> {
    return date
      ? this.validationRepo.findByValidatorIdAndDate(validatorUserId, date)
      : this.validationRepo.findByValidatorId(validatorUserId);
  }
}
