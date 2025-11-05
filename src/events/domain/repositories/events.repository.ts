import { EventEntity } from '../entities/event.entity';

export abstract class EventsRepository {
  abstract findAll(): Promise<EventEntity[]>;
  abstract findOneById(id: number): Promise<EventEntity | null>;
  abstract findOneByUuid(uuid: string): Promise<EventEntity | null>;
  abstract create(data: Partial<EventEntity>): EventEntity;
  abstract save(event: EventEntity): Promise<EventEntity>;
  abstract softDeleteById(id: number): Promise<void>;
  abstract softDeleteByUuid(uuid: string): Promise<void>;
}
