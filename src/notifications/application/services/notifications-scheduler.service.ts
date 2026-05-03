import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NotificationsService } from './notifications.service';
import { PaymentsService } from '../../../payments/application/services/payments.service';
import { TicketEntity } from '../../../payments/domain/entities/ticket.entity';
import { NotificationType } from '../../domain/enums/notification-type.enum';

@Injectable()
export class NotificationsSchedulerService {
  private readonly logger = new Logger(NotificationsSchedulerService.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly paymentsService: PaymentsService,
  ) {}

  /**
   * Cada día a las 8:00 AM busca los tickets activos con visitDate = hoy
   * y crea una notificación in-app de recordatorio para cada usuario.
   */
  @Cron('0 8 * * *', { timeZone: 'Europe/Madrid' })
  async sendVisitDayReminders(): Promise<void> {
    const today = new Date();
    const visitDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    this.logger.log(`Enviando recordatorios de visita para ${visitDate}`);

    let tickets: TicketEntity[];
    try {
      tickets = await this.paymentsService.getActiveTicketsByVisitDate(visitDate);
    } catch (err) {
      this.logger.error('Error al obtener tickets del día', err);
      return;
    }

    if (tickets.length === 0) {
      this.logger.log('No hay visitas programadas para hoy');
      return;
    }

    // Agrupar por userId para enviar una sola notificación por usuario
    // (puede tener varias entradas del mismo evento o distintos eventos)
    const byUser = new Map<number, { eventNames: Set<string>; userId: number }>();
    for (const ticket of tickets) {
      const userId = ticket.profile.userId;
      if (!byUser.has(userId)) {
        byUser.set(userId, { eventNames: new Set(), userId });
      }
      byUser.get(userId)!.eventNames.add(ticket.event.name);
    }

    for (const { userId, eventNames } of byUser.values()) {
      const names = [...eventNames];
      const title =
        names.length === 1
          ? `Hoy visitas: ${names[0]}`
          : `Hoy tienes ${names.length} visitas programadas`;
      const message =
        names.length === 1
          ? `Recuerda que hoy tienes una entrada para "${names[0]}". ¡Que lo disfrutes!`
          : `Tienes visitas para: ${names.join(', ')}. ¡Que lo disfrutes!`;

      try {
        await this.notificationsService.createNotification({
          userId,
          title,
          message,
          notificationType: NotificationType.EVENT,
        });
      } catch (err) {
        this.logger.error(`Error al crear notificación para userId ${userId}`, err);
      }
    }

    this.logger.log(`Recordatorios enviados a ${byUser.size} usuario(s)`);
  }
}
