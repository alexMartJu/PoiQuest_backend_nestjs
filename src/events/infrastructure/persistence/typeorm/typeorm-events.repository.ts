import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, QueryFailedError, Not, EntityManager, LessThanOrEqual, In } from 'typeorm';
import { EventsRepository, EventFilters } from '../../../domain/repositories/events.repository';
import { PaginatedResult } from '../../../domain/types/pagination';
import { EventEntity } from '../../../domain/entities/event.entity';
import { EventStatus } from '../../../domain/enums/event-status.enum';
import { EventAdminFilter } from '../../../domain/enums/event-admin-filter.enum';
import { ConflictError } from '../../../../shared/errors/conflict.error';

@Injectable()
export class TypeormEventsRepository implements EventsRepository {
  constructor(
    @InjectRepository(EventEntity)
    private readonly eventRepo: Repository<EventEntity>,
  ) {}

  async findAll(): Promise<EventEntity[]> {
    // Solo eventos ACTIVOS y no eliminados
    return await this.eventRepo.find({
      order: { createdAt: 'ASC' },
      where: { 
        status: EventStatus.ACTIVE,
        deletedAt: IsNull() 
      },
      relations: ['category', 'city', 'organizer', 'sponsor'],
    });
  }

  async findOneById(id: number): Promise<EventEntity | null> {
    return await this.eventRepo.findOne({ 
      where: { id, deletedAt: IsNull() },
      relations: ['category', 'city', 'organizer', 'sponsor'],
    });
  }

  async findOneByUuid(uuid: string): Promise<EventEntity | null> {
    return await this.eventRepo.findOne({ 
      where: { uuid, status: EventStatus.ACTIVE, deletedAt: IsNull() },
      relations: ['category', 'city', 'organizer', 'sponsor', 'pointsOfInterest', 'routes'],
    });
  }

  async findOneByUuidIncludingDeleted(uuid: string): Promise<EventEntity | null> {
    // Busca el evento por uuid sin filtrar por status ni deletedAt.
    // withDeleted: true permite recuperar registros soft-deleted.
    return await this.eventRepo.findOne({
      where: { uuid },
      withDeleted: true,
      relations: ['category', 'city', 'organizer', 'sponsor'],
    });
  }

  async findAllFinished(): Promise<EventEntity[]> {
    return await this.eventRepo.createQueryBuilder('event')
      .leftJoinAndSelect('event.category', 'category')
      .leftJoinAndSelect('event.city', 'city')
      .leftJoinAndSelect('event.organizer', 'organizer')
      .leftJoinAndSelect('event.sponsor', 'sponsor')
      .where('event.status = :status', { status: EventStatus.FINISHED })
      .andWhere('event.deletedAt IS NULL')
      .orderBy('event.createdAt', 'ASC')
      .getMany();
  }

  async findFinishedByUuid(uuid: string): Promise<EventEntity | null> {
    return await this.eventRepo.createQueryBuilder('event')
      .leftJoinAndSelect('event.category', 'category')
      .leftJoinAndSelect('event.city', 'city')
      .leftJoinAndSelect('event.organizer', 'organizer')
      .leftJoinAndSelect('event.sponsor', 'sponsor')
      .where('event.uuid = :uuid', { uuid })
      .andWhere('event.status = :status', { status: EventStatus.FINISHED })
      .andWhere('event.deletedAt IS NULL')
      .getOne();
  }

  create(data: Partial<EventEntity>): EventEntity {
    return this.eventRepo.create(data);
  }

  async save(event: EventEntity): Promise<EventEntity> {
    try {
      return await this.eventRepo.save(event);
    } catch (err) {
      // Mapear errores técnicos de la BD a errores de dominio
      if (err instanceof QueryFailedError) {
        const driverErr = (err as any).driverError;
        // MySQL/MariaDB ER_DUP_ENTRY (errno 1062), Postgres 23505
        if (driverErr?.code === 'ER_DUP_ENTRY' || driverErr?.errno === 1062 || driverErr?.code === '23505') {
          throw new ConflictError('Valor duplicado en la base de datos', { field: 'uuid' });
        }
      }
      // Re-lanzar otros errores no manejados
      throw err;
    }
  }

  async softDeleteById(id: number): Promise<void> {
    await this.eventRepo.softDelete(id);
  }

  async softDeleteByUuid(uuid: string): Promise<void> {
    // Usamos findOneByUuidIncludingDeleted para encontrar el evento sin importar su status
    const event = await this.findOneByUuidIncludingDeleted(uuid);
    if (event && !event.deletedAt) {
      await this.eventRepo.softDelete(event.id);
    }
  }

  async findOneByUuidAnyStatus(uuid: string): Promise<EventEntity | null> {
    return await this.eventRepo.findOne({
      where: { uuid, deletedAt: IsNull() },
      relations: ['category', 'city', 'organizer', 'sponsor', 'pointsOfInterest', 'routes'],
    });
  }

  async existsByCategoryId(categoryId: number): Promise<boolean> {
    // Contar sólo eventos no eliminados y que NO estén en estado FINISHED.
    // Así permitimos eliminar categorías si sus eventos están finalizados.
    const count = await this.eventRepo.count({
      where: { categoryId, deletedAt: IsNull(), status: Not(EventStatus.FINISHED) },
    });
    return count > 0;
  }

  async findByCategoryWithCursor(
    categoryUuid: string,
    cursor: string | undefined,
    limit: number,
    filters?: EventFilters,
  ): Promise<PaginatedResult> {
    const queryBuilder = this.eventRepo
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.category', 'category')
      .leftJoinAndSelect('event.city', 'city')
      .leftJoinAndSelect('event.organizer', 'organizer')
      .leftJoinAndSelect('event.sponsor', 'sponsor')
      .where('category.uuid = :categoryUuid', { categoryUuid })
      .andWhere('event.status = :status', { status: EventStatus.ACTIVE })
      .andWhere('event.deletedAt IS NULL')
      .andWhere('category.deletedAt IS NULL')
      .orderBy('event.createdAt', 'ASC')
      .limit(limit + 1); // Traemos 1 extra para saber si hay siguiente página

    // Si hay cursor, filtramos eventos creados antes de ese timestamp
    if (cursor) {
      // Convertimos el cursor ISO (ej: 2025-11-12T09:36:36.747Z) a Date
      // para que el driver/DB lo formatee correctamente al comparar DATETIME.
      const parsed = new Date(cursor);
      if (!isNaN(parsed.getTime())) {
        // Para paginación ascendente (los más antiguos primero) buscamos eventos
        // con createdAt > cursor (es decir, eventos más recientes que el cursor).
        queryBuilder.andWhere('event.createdAt > :cursor', { cursor: parsed });
      } else {
        // Si el cursor no es una fecha válida, aplicamos la comparación con el valor tal cual
        // (esto normalmente no debería pasar porque la validación se realiza en DTO).
        queryBuilder.andWhere('event.createdAt > :cursor', { cursor });
      }
    }

    // Aplicar filtros opcionales
    this.applyFilters(queryBuilder, filters);

    const events = await queryBuilder.getMany();

    // Determinamos si hay siguiente página
    const hasNextPage = events.length > limit;
    if (hasNextPage) {
      events.pop(); // Quitamos el registro extra
    }

    // El cursor para la siguiente página es el createdAt del último evento
    const nextCursor = hasNextPage && events.length > 0
      ? events[events.length - 1].createdAt.toISOString()
      : null;

    return {
      data: events,
      nextCursor,
      hasNextPage,
    };
  }

  async findAllWithCursor(
    cursor: string | undefined,
    limit: number,
    filters?: EventFilters,
  ): Promise<PaginatedResult> {
    const queryBuilder = this.eventRepo
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.category', 'category')
      .leftJoinAndSelect('event.city', 'city')
      .leftJoinAndSelect('event.organizer', 'organizer')
      .leftJoinAndSelect('event.sponsor', 'sponsor')
      .where('event.status = :status', { status: EventStatus.ACTIVE })
      .andWhere('event.deletedAt IS NULL')
      .orderBy('event.createdAt', 'ASC')
      .limit(limit + 1);

    if (cursor) {
      const parsed = new Date(cursor);
      if (!isNaN(parsed.getTime())) {
        queryBuilder.andWhere('event.createdAt > :cursor', { cursor: parsed });
      } else {
        queryBuilder.andWhere('event.createdAt > :cursor', { cursor });
      }
    }

    // Aplicar filtros opcionales
    this.applyFilters(queryBuilder, filters);

    const events = await queryBuilder.getMany();

    const hasNextPage = events.length > limit;
    if (hasNextPage) {
      events.pop();
    }

    const nextCursor = hasNextPage && events.length > 0
      ? events[events.length - 1].createdAt.toISOString()
      : null;

    return {
      data: events,
      nextCursor,
      hasNextPage,
    };
  }

  async findOneByUuidWithManager(manager: EntityManager, uuid: string): Promise<EventEntity | null> {
    return await manager.getRepository(EventEntity).findOne({
      where: { uuid, deletedAt: IsNull() },
      relations: ['category', 'city', 'organizer', 'sponsor', 'pointsOfInterest', 'routes'],
    });
  }

  async findAllForAdmin(
    filter: EventAdminFilter,
    cursor: string | undefined,
    limit: number,
  ): Promise<PaginatedResult> {
    const qb = this.eventRepo
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.category', 'category')
      .leftJoinAndSelect('event.city', 'city')
      .leftJoinAndSelect('event.organizer', 'organizer')
      .leftJoinAndSelect('event.sponsor', 'sponsor')
      .orderBy('event.createdAt', 'ASC')
      .limit(limit + 1);

    if (filter === EventAdminFilter.DELETED) {
      qb.withDeleted().where('event.deletedAt IS NOT NULL');
    } else {
      const statusMap: Record<EventAdminFilter, EventStatus | undefined> = {
        [EventAdminFilter.PENDING]: EventStatus.PENDING,
        [EventAdminFilter.ACTIVE]: EventStatus.ACTIVE,
        [EventAdminFilter.FINISHED]: EventStatus.FINISHED,
        [EventAdminFilter.DELETED]: undefined,
      };
      qb.where('event.status = :status', { status: statusMap[filter] })
        .andWhere('event.deletedAt IS NULL');
    }

    if (cursor) {
      const parsed = new Date(cursor);
      if (!isNaN(parsed.getTime())) {
        qb.andWhere('event.createdAt > :cursor', { cursor: parsed });
      } else {
        qb.andWhere('event.createdAt > :cursor', { cursor });
      }
    }

    const events = await qb.getMany();
    const hasNextPage = events.length > limit;
    if (hasNextPage) events.pop();

    const nextCursor =
      hasNextPage && events.length > 0
        ? events[events.length - 1].createdAt.toISOString()
        : null;

    return { data: events, nextCursor, hasNextPage };
  }

  async findActiveWithEndDateOnOrBefore(date: string): Promise<EventEntity[]> {
    return await this.eventRepo.find({
      where: {
        status: EventStatus.ACTIVE,
        deletedAt: IsNull(),
        endDate: LessThanOrEqual(date),
      },
    });
  }

  async markManyAsFinished(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    await this.eventRepo.update({ id: In(ids) }, { status: EventStatus.FINISHED });
  }

  async findPriceRange(): Promise<{ min: number; max: number }> {
    const result = await this.eventRepo
      .createQueryBuilder('event')
      .select('COALESCE(MIN(COALESCE(event.price, 0)), 0)', 'min')
      .addSelect('COALESCE(MAX(COALESCE(event.price, 0)), 0)', 'max')
      .where('event.status = :status', { status: EventStatus.ACTIVE })
      .andWhere('event.deletedAt IS NULL')
      .getRawOne();

    return {
      min: parseFloat(result?.min ?? '0'),
      max: parseFloat(result?.max ?? '0'),
    };
  }

  /**
   * Aplica filtros opcionales al QueryBuilder de eventos.
   */
  private applyFilters(
    qb: import('typeorm').SelectQueryBuilder<EventEntity>,
    filters?: EventFilters,
  ): void {
    if (!filters) return;

    if (filters.cityUuid) {
      qb.andWhere('city.uuid = :cityUuid', { cityUuid: filters.cityUuid });
    }

    if (filters.minPrice !== undefined) {
      qb.andWhere('COALESCE(event.price, 0) >= :minPrice', { minPrice: filters.minPrice });
    }

    if (filters.maxPrice !== undefined) {
      qb.andWhere('COALESCE(event.price, 0) <= :maxPrice', { maxPrice: filters.maxPrice });
    }

    if (filters.startDate) {
      qb.andWhere('event.startDate >= :filterStartDate', { filterStartDate: filters.startDate });
    }

    if (filters.endDate) {
      qb.andWhere('(event.endDate IS NOT NULL AND event.endDate <= :filterEndDate)', { filterEndDate: filters.endDate });
    }
  }
}
