import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { EventsService } from './events.service';

@Injectable()
export class EventsSchedulerService {
  private readonly logger = new Logger(EventsSchedulerService.name);

  constructor(private readonly eventsService: EventsService) {}

  /// Se ejecuta todos los días a las 23:00 para marcar como FINISHED
  /// los eventos ACTIVE cuya fecha de fin ya ha llegado.
  @Cron('0 23 * * *', { timeZone: 'Europe/Madrid' })
  async handleExpiredEvents(): Promise<void> {
    this.logger.log('Iniciando tarea programada: comprobación de eventos vencidos...');
    try {
      const count = await this.eventsService.markExpiredEventsAsFinished();
      if (count > 0) {
        this.logger.log(`${count} evento(s) marcados como FINISHED por fecha de fin alcanzada`);
      } else {
        this.logger.log('No se encontraron eventos vencidos que actualizar');
      }
    } catch (err) {
      this.logger.error('Error al ejecutar la tarea programada de eventos vencidos', err);
    }
  }
}
