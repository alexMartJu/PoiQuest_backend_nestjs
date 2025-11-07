import { EventCategoryEntity } from '../entities/event-category.entity';

export abstract class EventCategoriesRepository {
  abstract findAll(): Promise<EventCategoryEntity[]>;
  abstract findOneById(id: number): Promise<EventCategoryEntity | null>;
  abstract findOneByUuid(uuid: string): Promise<EventCategoryEntity | null>;
  abstract findOneByUuidIncludingDeleted(uuid: string): Promise<EventCategoryEntity | null>;
  abstract create(data: Partial<EventCategoryEntity>): EventCategoryEntity;
  abstract save(category: EventCategoryEntity): Promise<EventCategoryEntity>;
  abstract softDeleteByUuid(uuid: string): Promise<void>;
}
