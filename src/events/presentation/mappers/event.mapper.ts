import { EventEntity } from '../../domain/entities/event.entity';
import { EventResponse } from '../dto/responses/event.response.dto';
import { EventCategoryMapper } from './event-category.mapper';
import { PointOfInterestMapper } from './point-of-interest.mapper';
import { ImageEntity } from '../../../media/domain/entities/image.entity';
import { ImageMapper } from '../../../media/presentation/mappers/image.mapper';

export class EventMapper {
  static toResponse(event: EventEntity, includePois = false, images?: ImageEntity[]): EventResponse {
    const response: EventResponse = {
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
      images: ImageMapper.toResponseList(images ?? []),
    };

    // Incluir POIs solo si se solicita y están cargados
    if (includePois && event.pointsOfInterest) {
      response.pointsOfInterest = PointOfInterestMapper.toResponseListWithoutEvent(event.pointsOfInterest);
    }

    return response;
  }

  static toResponseList(list: EventEntity[], includePois = false, imagesMap?: Map<number, ImageEntity[]>): EventResponse[] {
    return list.map(event => {
      const images = imagesMap?.get(event.id);
      return EventMapper.toResponse(event, includePois, images);
    });
  }
}
