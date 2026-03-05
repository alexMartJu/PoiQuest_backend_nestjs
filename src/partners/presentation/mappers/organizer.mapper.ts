import { OrganizerEntity } from '../../domain/entities/organizer.entity';
import { OrganizerResponse } from '../dto/responses/organizer.response.dto';
import { ImageEntity } from '../../../media/domain/entities/image.entity';
import { ImageMapper } from '../../../media/presentation/mappers/image.mapper';

export class OrganizerMapper {
  static toResponse(
    organizer: OrganizerEntity,
    images?: ImageEntity[],
    presignedUrlsMap?: Map<number, string>,
  ): OrganizerResponse {
    return {
      uuid: organizer.uuid,
      name: organizer.name,
      type: organizer.type,
      contactEmail: organizer.contactEmail,
      contactPhone: organizer.contactPhone ?? null,
      description: organizer.description ?? null,
      status: organizer.status,
      images: ImageMapper.toResponseList(images ?? [], presignedUrlsMap),
      createdAt: organizer.createdAt,
      updatedAt: organizer.updatedAt,
    };
  }

  static toResponseList(
    list: OrganizerEntity[],
    imagesMap?: Map<number, ImageEntity[]>,
    presignedUrlsMap?: Map<number, string>,
  ): OrganizerResponse[] {
    return list.map(organizer => {
      const images = imagesMap?.get(organizer.id);
      return this.toResponse(organizer, images, presignedUrlsMap);
    });
  }
}
