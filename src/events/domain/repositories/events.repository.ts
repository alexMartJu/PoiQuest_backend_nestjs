import { EventEntity } from '../entities/event.entity';
import { PaginatedResult } from '../types/pagination';
import { EntityManager } from 'typeorm';

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
   * Variante transaccional de `findOneByUuid` que usa un `EntityManager`
   * para realizar la consulta dentro del contexto de una transacción.
   */
  abstract findOneByUuidWithManager(manager: EntityManager, uuid: string): Promise<EventEntity | null>;
  
  /**
   * Obtiene eventos activos de una categoría específica con paginación basada en cursor.
   * @param categoryUuid UUID de la categoría
   * @param cursor Timestamp ISO del último evento de la página anterior (opcional)
   * @param limit Número de eventos a devolver
   */
  abstract findByCategoryWithCursor(
    categoryUuid: string, 
    cursor: string | undefined, 
    limit: number
  ): Promise<PaginatedResult>;
  
  /** Devuelve true si existe al menos un evento no eliminado asociado a la categoría */
  abstract existsByCategoryId(categoryId: number): Promise<boolean>;
  abstract create(data: Partial<EventEntity>): EventEntity;
  abstract save(event: EventEntity): Promise<EventEntity>;
  abstract softDeleteById(id: number): Promise<void>;
  abstract softDeleteByUuid(uuid: string): Promise<void>;
}
