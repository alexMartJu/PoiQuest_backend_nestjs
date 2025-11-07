import { EventEntity } from '../entities/event.entity';

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
  /** Devuelve true si existe al menos un evento no eliminado asociado a la categoría */
  abstract existsByCategoryId(categoryId: number): Promise<boolean>;
  abstract create(data: Partial<EventEntity>): EventEntity;
  abstract save(event: EventEntity): Promise<EventEntity>;
  abstract softDeleteById(id: number): Promise<void>;
  abstract softDeleteByUuid(uuid: string): Promise<void>;
}
