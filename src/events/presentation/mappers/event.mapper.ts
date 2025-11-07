import { EventEntity } from '../../domain/entities/event.entity';
import { EventResponse } from '../dto/responses/event.response.dto';
import { EventCategoryMapper } from './event-category.mapper';

export class EventMapper {
  static toResponse(event: EventEntity): EventResponse {
    return {
      uuid: event.uuid,
      name: event.name,
      description: event.description ?? null,
      category: EventCategoryMapper.toResponse(event.category) ?? null,
      status: event.status,
      location: event.location ?? null,
      startDate: event.startDate,
      endDate: event.endDate ?? null,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }

  static toResponseList(list: EventEntity[]): EventResponse[] {
    return list.map(EventMapper.toResponse);
  }
}
