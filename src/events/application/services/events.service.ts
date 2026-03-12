import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EventsRepository } from '../../domain/repositories/events.repository';
import { EventCategoriesRepository } from '../../domain/repositories/event-categories.repository';
import { PointsOfInterestRepository } from '../../domain/repositories/points-of-interest.repository';
import { EventEntity } from '../../domain/entities/event.entity';
import { EventStatus } from '../../domain/enums/event-status.enum';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { CursorPaginationDto } from '../dto/cursor-pagination.dto';
import { PaginatedEventsDto } from '../dto/paginated-events.dto';
import { AdminEventsPaginationDto } from '../dto/admin-events-pagination.dto';
import { NotFoundError } from '../../../shared/errors/not-found.error';
import { ValidationError } from '../../../shared/errors/validation.error';
import { ImagesService } from '../../../media/application/services/images.service';
import { ImageableType } from '../../../media/domain/enums/imageable-type.enum';
import { CitiesRepository } from '../../../partners/domain/repositories/cities.repository';
import { OrganizersRepository } from '../../../partners/domain/repositories/organizers.repository';
import { SponsorsRepository } from '../../../partners/domain/repositories/sponsors.repository';
import { RoutesRepository } from '../../domain/repositories/routes.repository';

@Injectable()
export class EventsService {
  constructor(
    private readonly eventsRepo: EventsRepository,
    private readonly categoriesRepo: EventCategoriesRepository,
    private readonly imagesService: ImagesService,
    private readonly dataSource: DataSource,
    private readonly citiesRepo: CitiesRepository,
    private readonly organizersRepo: OrganizersRepository,
    private readonly sponsorsRepo: SponsorsRepository,
    private readonly poisRepo: PointsOfInterestRepository,
    private readonly routesRepo: RoutesRepository,
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

  /// Obtiene eventos activos de una categoría con paginación basada en cursor
  async findByCategoryWithCursor(
    categoryUuid: string,
    pagination: CursorPaginationDto,
  ): Promise<PaginatedEventsDto> {
    // Validar que la categoría existe y no está eliminada
    const category = await this.categoriesRepo.findOneByUuid(categoryUuid);
    if (!category) {
      throw new NotFoundError('Categoría no encontrada', { categoryUuid });
    }

    const limit = pagination.limit ?? 3;
    const result = await this.eventsRepo.findByCategoryWithCursor(
      categoryUuid,
      pagination.cursor,
      limit,
    );

    return {
      data: result.data,
      nextCursor: result.nextCursor,
      hasNextPage: result.hasNextPage,
    };
  }

  /// Obtiene eventos activos con paginación basada en cursor (sin filtrar por categoría)
  async findAllWithCursor(
    pagination: CursorPaginationDto,
  ): Promise<PaginatedEventsDto> {
    const limit = pagination.limit ?? 3;
    const result = await this.eventsRepo.findAllWithCursor(pagination.cursor, limit);

    return {
      data: result.data,
      nextCursor: result.nextCursor,
      hasNextPage: result.hasNextPage,
    };
  }

  /// Crea un nuevo evento
  async createEvent(dto: CreateEventDto): Promise<EventEntity> {
    // Validaciones de fechas
    this.validateDates(dto.startDate, dto.endDate);

    // Validar categoría
    const category = await this.categoriesRepo.findOneByUuid(dto.categoryUuid);
    if (!category || (category as any).deletedAt) {
      throw new NotFoundError('Categoría no encontrada', { categoryUuid: dto.categoryUuid });
    }

    // Validar ciudad
    const city = await this.citiesRepo.findOneByUuid(dto.cityUuid);
    if (!city) {
      throw new NotFoundError('Ciudad no encontrada', { cityUuid: dto.cityUuid });
    }

    // Validar organizador
    const organizer = await this.organizersRepo.findOneByUuid(dto.organizerUuid);
    if (!organizer) {
      throw new NotFoundError('Organizador no encontrado', { organizerUuid: dto.organizerUuid });
    }

    // Validar patrocinador (opcional)
    let sponsorId: number | null = null;
    if (dto.sponsorUuid) {
      const sponsor = await this.sponsorsRepo.findOneByUuid(dto.sponsorUuid);
      if (!sponsor) {
        throw new NotFoundError('Patrocinador no encontrado', { sponsorUuid: dto.sponsorUuid });
      }
      sponsorId = (sponsor as any).id;
    }

    // Validar precio solo si isPremium
    if (!dto.isPremium && dto.price != null) {
      throw new ValidationError('El precio solo aplica cuando el evento es premium', {});
    }

    // Usar transacción para crear evento e imágenes
    return await this.dataSource.transaction(async (manager) => {
      const event = this.eventsRepo.create({
        name: dto.name,
        description: dto.description ?? null,
        categoryId: (category as any).id,
        cityId: (city as any).id,
        organizerId: (organizer as any).id,
        sponsorId: sponsorId,
        isPremium: dto.isPremium,
        price: dto.isPremium ? (dto.price ?? null) : null,
        capacityPerDay: dto.capacityPerDay ?? null,
        status: EventStatus.PENDING,
        startDate: dto.startDate,
        endDate: dto.endDate ?? null,
      });

      const saved = await manager.save(event);

      const images = dto.imageFileNames.map(fileName => ({
        fileName,
        bucket: 'images',
      }));

      await this.imagesService.attachImages({
        imageableType: ImageableType.EVENT,
        imageableId: saved.id,
        images,
      }, manager);

      const savedWithRelations = await this.eventsRepo.findOneByUuidWithManager(manager, saved.uuid);
      if (!savedWithRelations) {
        throw new NotFoundError('Evento creado no encontrado después de guardar', { uuid: saved.uuid });
      }
      return savedWithRelations;
    });
  }

  /// Actualiza un evento existente por uuid
  async updateByUuid(uuid: string, dto: UpdateEventDto): Promise<EventEntity> {
    // Buscar sin filtros para distinguir "no existe" de "existe pero no está ACTIVE"
    const event = await this.eventsRepo.findOneByUuidIncludingDeleted(uuid);
    if (!event) {
      throw new NotFoundError('Evento no encontrado', { uuid });
    }
    if (event.deletedAt) {
      throw new NotFoundError('Evento no encontrado', { uuid });
    }
    if (event.status === EventStatus.FINISHED) {
      throw new ValidationError('No se pueden actualizar eventos con estado FINISHED', { uuid, status: event.status });
    }

    // Validar ciudad (si se actualiza)
    if (dto.cityUuid !== undefined) {
      const city = await this.citiesRepo.findOneByUuid(dto.cityUuid);
      if (!city) {
        throw new NotFoundError('Ciudad no encontrada', { cityUuid: dto.cityUuid });
      }
      event.cityId = (city as any).id;
      (event as any).city = city;
    }

    // Validar organizador (si se actualiza)
    if (dto.organizerUuid !== undefined) {
      const organizer = await this.organizersRepo.findOneByUuid(dto.organizerUuid);
      if (!organizer) {
        throw new NotFoundError('Organizador no encontrado', { organizerUuid: dto.organizerUuid });
      }
      event.organizerId = (organizer as any).id;
      (event as any).organizer = organizer;
    }

    // Validar patrocinador (si se actualiza; puede ser null para limpiar)
    if (dto.sponsorUuid !== undefined) {
      if (dto.sponsorUuid === null) {
        event.sponsorId = null;
        (event as any).sponsor = null;
      } else {
        const sponsor = await this.sponsorsRepo.findOneByUuid(dto.sponsorUuid);
        if (!sponsor) {
          throw new NotFoundError('Patrocinador no encontrado', { sponsorUuid: dto.sponsorUuid });
        }
        event.sponsorId = (sponsor as any).id;
        (event as any).sponsor = sponsor;
      }
    }

    // Usar transacción para actualizar evento e imágenes
    return await this.dataSource.transaction(async (manager) => {
      if (dto.name !== undefined) event.name = dto.name;
      if (dto.description !== undefined) event.description = dto.description ?? null;
      if (dto.startDate !== undefined) event.startDate = dto.startDate;
      if (dto.endDate !== undefined) event.endDate = dto.endDate ?? null;
      if (dto.isPremium !== undefined) event.isPremium = dto.isPremium;
      if (dto.price !== undefined) event.price = dto.price ?? null;
      if (dto.capacityPerDay !== undefined) event.capacityPerDay = dto.capacityPerDay ?? null;

      // Valida fechas si se actualizan
      if (dto.startDate !== undefined || dto.endDate !== undefined) {
        this.validateDates(event.startDate, event.endDate);
      }

      // Si se actualizó categoryUuid, validar que exista y asignar el categoryId interno
      if (dto.categoryUuid !== undefined) {
        const category = await this.categoriesRepo.findOneByUuid(dto.categoryUuid);
        if (!category || (category as any).deletedAt) {
          throw new NotFoundError('Categoría no encontrada', { categoryUuid: dto.categoryUuid });
        }
        event.categoryId = (category as any).id;
        (event as any).category = category;
      }

      const saved = await manager.save(event);

      if (dto.imageFileNames !== undefined) {
        const images = dto.imageFileNames.map(fileName => ({
          fileName,
          bucket: 'images',
        }));

        await this.imagesService.updateImages({
          imageableType: ImageableType.EVENT,
          imageableId: saved.id,
          images,
        }, manager);
      }

      const savedWithRelations = await this.eventsRepo.findOneByUuidWithManager(manager, saved.uuid);
      if (!savedWithRelations) {
        throw new NotFoundError('Evento no encontrado después de actualizar', { uuid: saved.uuid });
      }
      return savedWithRelations;
    });
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
    // Solo se permite eliminar si el evento está PENDING o ACTIVE
    if (event.status === EventStatus.FINISHED) {
      throw new ValidationError('No se pueden eliminar eventos con estado FINISHED', { uuid, status: event.status });
    }

    try {
      // Cascade soft delete a POIs y rutas del evento
      await this.poisRepo.softDeleteByEventId(event.id);
      await this.routesRepo.softDeleteByEventId(event.id);
      await this.eventsRepo.softDeleteByUuid(uuid);
    } catch (e: any) {
      throw new ValidationError('No se pudo eliminar el evento', { uuid, error: e.message });
    }
  }

  // ============ Funciones auxiliares ============

  // Busca un evento ACTIVE por uuid o lanza NotFoundError (uso público)
  async findEventByUuidOrFail(uuid: string): Promise<EventEntity> {
    const event = await this.eventsRepo.findOneByUuid(uuid);
    if (!event) {
      throw new NotFoundError('Evento no encontrado', { uuid });
    }
    return event;
  }

  /// Obtiene el detalle de un evento por uuid sin filtrar por estado (uso admin).
  /// Devuelve cualquier evento no eliminado (pending, active o finished).
  async findOneByUuidForAdmin(uuid: string): Promise<EventEntity> {
    const event = await this.eventsRepo.findOneByUuidAnyStatus(uuid);
    if (!event) {
      throw new NotFoundError('Evento no encontrado', { uuid });
    }
    return event;
  }

  /// Lista todos los eventos para el administrador con paginación por cursor y filtro de estado
  async findAllForAdmin(dto: AdminEventsPaginationDto): Promise<PaginatedEventsDto> {
    const limit = dto.limit ?? 10;
    const result = await this.eventsRepo.findAllForAdmin(dto.filter, dto.cursor, limit);
    return {
      data: result.data,
      nextCursor: result.nextCursor,
      hasNextPage: result.hasNextPage,
    };
  }

  /// Activa un evento pendiente (PENDING → ACTIVE). Requiere al menos un POI asociado.
  async activateEventByUuid(uuid: string): Promise<EventEntity> {
    const event = await this.eventsRepo.findOneByUuidIncludingDeleted(uuid);
    if (!event || event.deletedAt) {
      throw new NotFoundError('Evento no encontrado', { uuid });
    }
    if (event.status !== EventStatus.PENDING) {
      throw new ValidationError(
        'Solo se pueden activar eventos con estado PENDING',
        { uuid, status: event.status },
      );
    }

    const pois = await this.poisRepo.findByEventId(event.id);
    if (pois.length === 0) {
      throw new ValidationError(
        'El evento debe tener al menos un punto de interés asociado antes de poder activarse',
        { uuid },
      );
    }

    const routes = await this.routesRepo.findByEventId(event.id);
    if (routes.length === 0) {
      throw new ValidationError(
        'El evento debe tener al menos una ruta asociada antes de poder activarse',
        { uuid },
      );
    }

    event.status = EventStatus.ACTIVE;
    await this.eventsRepo.save(event);

    // Recuperar el evento con todas sus relaciones ya en estado ACTIVE
    return await this.findEventByUuidOrFail(uuid);
  }

  /// Marca como FINISHED todos los eventos ACTIVE cuya fecha de fin ya ha llegado.
  /// Llamado por el scheduler diario.
  async markExpiredEventsAsFinished(): Promise<number> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const events = await this.eventsRepo.findActiveWithEndDateOnOrBefore(today);
    if (events.length === 0) return 0;
    const ids = events.map(e => e.id);
    await this.eventsRepo.markManyAsFinished(ids);
    return ids.length;
  }

  // Valida que la fecha de fin sea posterior a la de inicio
  private validateDates(startDate: string, endDate?: string | null): void {
    if (endDate && startDate > endDate) {
      throw new ValidationError('La fecha de fin debe ser posterior a la fecha de inicio', { startDate, endDate });
    }
  }
}
