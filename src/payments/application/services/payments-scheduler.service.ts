import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PaymentsService } from './payments.service';

@Injectable()
export class PaymentsSchedulerService {
  private readonly logger = new Logger(PaymentsSchedulerService.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  /// Se ejecuta todos los días a las 23:59 para marcar como EXPIRED
  /// los tickets ACTIVE cuya fecha de visita ya ha pasado.
  @Cron('59 23 * * *', { timeZone: 'Europe/Madrid' })
  async handleExpiredTickets(): Promise<void> {
    this.logger.log('Iniciando tarea programada: comprobación de tickets vencidos...');
    try {
      const count = await this.paymentsService.markExpiredTickets();
      if (count > 0) {
        this.logger.log(`${count} ticket(s) marcados como EXPIRED por fecha de visita pasada`);
      } else {
        this.logger.log('No se encontraron tickets vencidos que actualizar');
      }
    } catch (err) {
      this.logger.error('Error al ejecutar la tarea programada de tickets vencidos', err);
    }
  }
}
