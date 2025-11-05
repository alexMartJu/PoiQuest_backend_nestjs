import { Injectable } from '@nestjs/common';
import { EventsRepository } from '../../domain/repositories/events.repository';
import { EventEntity } from '../../domain/entities/event.entity';
import { EventType } from '../../domain/enums/event-type.enum';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { NotFoundError } from '../../../shared/errors/not-found.error';
import { ValidationError } from '../../../shared/errors/validation.error';

@Injectable()
export class EventsService {
  constructor(
    private readonly eventsRepo: EventsRepository,
  ) {}

  /// Obtiene todos los eventos (no eliminados)
  async findAll(): Promise<EventEntity[]> {
    return await this.eventsRepo.findAll();
  }

  /// Obtiene un evento por su uuid
  async findOneByUuid(uuid: string): Promise<EventEntity> {
    return this.findEventByUuidOrFail(uuid);
  }

  /// Crea un nuevo evento
  async createEvent(dto: CreateEventDto): Promise<EventEntity> {
    // Validaciones de fechas
    this.validateDates(dto.startDate, dto.endDate);

    // Crea evento (uuid será generado automáticamente en la entidad)
    const event = this.eventsRepo.create({
      name: dto.name,
      description: dto.description ?? null,
      type: dto.type,
      location: dto.location ?? null,
      startDate: dto.startDate,
      endDate: dto.endDate ?? null,
    });

    return await this.eventsRepo.save(event);
  }

  /// Actualiza un evento existente por uuid
  async updateByUuid(uuid: string, dto: UpdateEventDto): Promise<EventEntity> {
    // Verifica que el evento exista
    const event = await this.findEventByUuidOrFail(uuid);

    // Asigna campos permitidos
    if (dto.name !== undefined) event.name = dto.name;
    if (dto.description !== undefined) event.description = dto.description ?? null;
    if (dto.type !== undefined) event.type = dto.type as EventType;
    if (dto.location !== undefined) event.location = dto.location ?? null;
    if (dto.startDate !== undefined) event.startDate = dto.startDate;
    if (dto.endDate !== undefined) event.endDate = dto.endDate ?? null;

    // Valida fechas si se actualizan
    if (dto.startDate !== undefined || dto.endDate !== undefined) {
      this.validateDates(event.startDate, event.endDate);
    }

    return await this.eventsRepo.save(event);
  }

  /// Elimina un evento (soft delete) por uuid
  async removeByUuid(uuid: string): Promise<void> {
    // Verifica que el evento exista
    await this.findEventByUuidOrFail(uuid);

    try {
      await this.eventsRepo.softDeleteByUuid(uuid);
    } catch (e: any) {
      throw new ValidationError('No se pudo eliminar el evento', { uuid, error: e.message });
    }
  }

  // ============ Funciones auxiliares ============

  // Busca un evento por uuid o lanza NotFoundError
  async findEventByUuidOrFail(uuid: string): Promise<EventEntity> {
    const event = await this.eventsRepo.findOneByUuid(uuid);
    if (!event) {
      throw new NotFoundError('Evento no encontrado', { uuid });
    }
    return event;
  }

  // Valida que la fecha de fin sea posterior a la de inicio
  private validateDates(startDate: string, endDate?: string | null): void {
    if (endDate && startDate > endDate) {
      throw new ValidationError('La fecha de fin debe ser posterior a la fecha de inicio', { startDate, endDate });
    }
  }
}
