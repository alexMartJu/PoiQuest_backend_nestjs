import { Injectable } from '@nestjs/common';
import { EventsRepository } from '../../domain/repositories/events.repository';
import { EventEntity } from '../../domain/entities/event.entity';
import { EventType } from '../../domain/enums/event-type.enum';
import { EventStatus } from '../../domain/enums/event-status.enum';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { NotFoundError } from '../../../shared/errors/not-found.error';
import { ValidationError } from '../../../shared/errors/validation.error';

@Injectable()
export class EventsService {
  constructor(
    private readonly eventsRepo: EventsRepository,
  ) {}

  /// Obtiene todos los eventos activos (no eliminados)
  async findAll(): Promise<EventEntity[]> {
    return await this.eventsRepo.findAll();
  }

  /// Obtiene un evento por su uuid
  async findOneByUuid(uuid: string): Promise<EventEntity> {
    return this.findEventByUuidOrFail(uuid);
  }

  /// Obtiene todos los eventos finalizados (no eliminados)
  async findAllFinished(): Promise<EventEntity[]> {
    return await this.eventsRepo.findAllFinished();
  }

  /// Obtiene un evento finalizado por su uuid
  async findFinishedByUuid(uuid: string): Promise<EventEntity> {
    const event = await this.eventsRepo.findFinishedByUuid(uuid);
    if (!event) {
      throw new NotFoundError('Evento finalizado no encontrado', { uuid });
    }
    return event;
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
      status: EventStatus.ACTIVE, // Por defecto se crea como ACTIVE
      location: dto.location ?? null,
      startDate: dto.startDate,
      endDate: dto.endDate ?? null,
    });

    return await this.eventsRepo.save(event);
  }

  /// Actualiza un evento existente por uuid
  async updateByUuid(uuid: string, dto: UpdateEventDto): Promise<EventEntity> {
    // Buscar sin filtros para distinguir "no existe" de "existe pero no está ACTIVE"
    const event = await this.eventsRepo.findOneByUuidIncludingDeleted(uuid);
    if (!event) {
      throw new NotFoundError('Evento no encontrado', { uuid });
    }
    // Si está soft-deleted, lo tratamos como no encontrado (404)
    if (event.deletedAt) {
      throw new NotFoundError('Evento no encontrado', { uuid });
    }
    // Si existe pero no está ACTIVE, devolver ValidationError (400)
    if (event.status !== EventStatus.ACTIVE) {
      throw new ValidationError('Solo se pueden actualizar eventos con estado ACTIVE', { uuid, status: event.status });
    }

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
    // Buscar sin filtros para distinguir 404 de ValidationError
    const event = await this.eventsRepo.findOneByUuidIncludingDeleted(uuid);
    if (!event) {
      throw new NotFoundError('Evento no encontrado', { uuid });
    }
    // Si está soft-deleted, lo tratamos como no encontrado (404)
    if (event.deletedAt) {
      throw new NotFoundError('Evento no encontrado', { uuid });
    }
    // Solo se permite eliminar si el evento está ACTIVE
    if (event.status !== EventStatus.ACTIVE) {
      throw new ValidationError('Solo se pueden eliminar eventos con estado ACTIVE', { uuid, status: event.status });
    }

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
