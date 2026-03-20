import { EventEntity } from '../entities/event.entity';
import { PaginatedResult } from '../types/pagination';
import { EntityManager } from 'typeorm';
import { EventAdminFilter } from '../enums/event-admin-filter.enum';
import { EventStatus } from '../enums/event-status.enum';

export interface EventFilters {
  cityUuid?: string;
  minPrice?: number;
  maxPrice?: number;
  startDate?: string;
  endDate?: string;
}

export abstract class EventsRepository {
  abstract findAll(): Promise<EventEntity[]>;
  abstract findAllFinished(): Promise<EventEntity[]>;
  abstract findOneById(id: number): Promise<EventEntity | null>;
  abstract findFinishedByUuid(uuid: string): Promise<EventEntity | null>;
  /**
   * Busca un evento por UUID sin aplicar filtros de status ni deletedAt.
   * Útil para operaciones que necesitan distinguir entre "no existe" y
   * "existe pero no está ACTIVE".
   */
  abstract findOneByUuidIncludingDeleted(uuid: string): Promise<EventEntity | null>;

  abstract findOneByUuid(uuid: string): Promise<EventEntity | null>;
  /**
   * Busca un evento por UUID sin filtrar por status, pero excluyendo los eliminados.
   * Útil para el panel de administración donde se necesita ver cualquier evento no borrado.
   */
  abstract findOneByUuidAnyStatus(uuid: string): Promise<EventEntity | null>;
  /**
   * Variante transaccional de `findOneByUuid` que usa un `EntityManager`
   * para realizar la consulta dentro del contexto de una transacción.
   */
  abstract findOneByUuidWithManager(manager: EntityManager, uuid: string): Promise<EventEntity | null>;
  
  /**
   * Obtiene eventos activos de una categoría específica con paginación basada en cursor.
   * @param categoryUuid UUID de la categoría
   * @param cursor Timestamp ISO del último evento de la página anterior (opcional)
   * @param limit Número de eventos a devolver
   * @param filters Filtros opcionales (ciudad, precio, fechas)
   */
  abstract findByCategoryWithCursor(
    categoryUuid: string, 
    cursor: string | undefined, 
    limit: number,
    filters?: EventFilters,
  ): Promise<PaginatedResult>;

  /** Obtiene eventos activos con paginación basada en cursor (sin filtrar por categoría). */
  abstract findAllWithCursor(
    cursor: string | undefined,
    limit: number,
    filters?: EventFilters,
  ): Promise<PaginatedResult>;
  
  /** Devuelve true si existe al menos un evento no eliminado asociado a la categoría */
  abstract existsByCategoryId(categoryId: number): Promise<boolean>;
  abstract create(data: Partial<EventEntity>): EventEntity;
  abstract save(event: EventEntity): Promise<EventEntity>;
  abstract softDeleteById(id: number): Promise<void>;
  abstract softDeleteByUuid(uuid: string): Promise<void>;

  /**
   * Lista todos los eventos paginados para el panel de administración,
   * filtrados por el estado indicado (pending, active, finished, deleted).
   */
  abstract findAllForAdmin(
    filter: EventAdminFilter,
    cursor: string | undefined,
    limit: number,
  ): Promise<PaginatedResult>;

  /**
   * Devuelve todos los eventos ACTIVE (no eliminados) cuya fecha de fin
   * sea igual o anterior a la fecha indicada (formato YYYY-MM-DD).
   * Se usa para el scheduler de cierre automático.
   */
  abstract findActiveWithEndDateOnOrBefore(date: string): Promise<EventEntity[]>;

  /**
   * Marca como FINISHED todos los eventos cuyos ids se indican.
   */
  abstract markManyAsFinished(ids: number[]): Promise<void>;

  /**
   * Devuelve el rango de precios (min, max) de los eventos activos no eliminados.
   */
  abstract findPriceRange(): Promise<{ min: number; max: number }>;
}
