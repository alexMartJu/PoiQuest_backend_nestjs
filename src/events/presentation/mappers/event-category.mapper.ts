import { EventCategoryEntity } from '../../domain/entities/event-category.entity';
import { EventCategoryResponse } from '../dto/responses/event-category.response.dto';

export class EventCategoryMapper {
  static toResponse(category: EventCategoryEntity | null): EventCategoryResponse | null {
    if (!category) return null;
    return {
      uuid: category.uuid,
      name: category.name,
      description: category.description ?? null,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  static toResponseList(list: EventCategoryEntity[]): EventCategoryResponse[] {
    return list.map(EventCategoryMapper.toResponse).filter((c): c is EventCategoryResponse => c !== null);
  }
}
