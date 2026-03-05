import { EventEntity } from '../../domain/entities/event.entity';
import { EventResponse } from '../dto/responses/event.response.dto';
import { EventCategoryMapper } from './event-category.mapper';
import { PointOfInterestMapper } from './point-of-interest.mapper';
import { ImageEntity } from '../../../media/domain/entities/image.entity';
import { ImageMapper } from '../../../media/presentation/mappers/image.mapper';
import { CityMapper } from '../../../partners/presentation/mappers/city.mapper';
import { OrganizerMapper } from '../../../partners/presentation/mappers/organizer.mapper';
import { SponsorMapper } from '../../../partners/presentation/mappers/sponsor.mapper';

export class EventMapper {
  static toResponse(
    event: EventEntity,
    includePois = false,
    images?: ImageEntity[],
    presignedUrlsMap?: Map<number, string>,
    organizerImagesMap?: Map<number, ImageEntity[]>,
    sponsorImagesMap?: Map<number, ImageEntity[]>,
  ): EventResponse {
    const response: EventResponse = {
      uuid: event.uuid,
      name: event.name,
      description: event.description ?? null,
      category: EventCategoryMapper.toResponse(event.category) ?? null,
      status: event.status,
      city: event.city ? CityMapper.toResponse(event.city) : null,
      organizer: event.organizer
        ? OrganizerMapper.toResponse(
            event.organizer,
            organizerImagesMap?.get(event.organizer.id),
            presignedUrlsMap,
          )
        : null,
      sponsor: event.sponsor
        ? SponsorMapper.toResponse(
            event.sponsor,
            sponsorImagesMap?.get(event.sponsor.id),
            presignedUrlsMap,
          )
        : null,
      isPremium: event.isPremium,
      price: event.price ?? null,
      capacityPerDay: event.capacityPerDay ?? null,
      startDate: event.startDate,
      endDate: event.endDate ?? null,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      images: ImageMapper.toResponseList(images ?? [], presignedUrlsMap),
    };

    // Incluir POIs solo si se solicita y están cargados
    if (includePois && event.pointsOfInterest) {
      response.pointsOfInterest = PointOfInterestMapper.toResponseListWithoutEvent(
        event.pointsOfInterest,
        undefined,
        presignedUrlsMap,
      );
    }

    return response;
  }

  static toResponseList(
    list: EventEntity[],
    includePois = false,
    imagesMap?: Map<number, ImageEntity[]>,
    presignedUrlsMap?: Map<number, string>,
    organizerImagesMap?: Map<number, ImageEntity[]>,
    sponsorImagesMap?: Map<number, ImageEntity[]>,
  ): EventResponse[] {
    return list.map(event => {
      const images = imagesMap?.get(event.id);
      return EventMapper.toResponse(event, includePois, images, presignedUrlsMap, organizerImagesMap, sponsorImagesMap);
    });
  }
}
