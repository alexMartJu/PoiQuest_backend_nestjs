import { SponsorEntity } from '../../domain/entities/sponsor.entity';
import { SponsorResponse } from '../dto/responses/sponsor.response.dto';
import { ImageEntity } from '../../../media/domain/entities/image.entity';
import { ImageMapper } from '../../../media/presentation/mappers/image.mapper';

export class SponsorMapper {
  static toResponse(
    sponsor: SponsorEntity,
    images?: ImageEntity[],
    presignedUrlsMap?: Map<number, string>,
  ): SponsorResponse {
    return {
      uuid: sponsor.uuid,
      name: sponsor.name,
      websiteUrl: sponsor.websiteUrl ?? null,
      contactEmail: sponsor.contactEmail ?? null,
      description: sponsor.description ?? null,
      status: sponsor.status,
      images: ImageMapper.toResponseList(images ?? [], presignedUrlsMap),
      createdAt: sponsor.createdAt,
      updatedAt: sponsor.updatedAt,
    };
  }

  static toResponseList(
    list: SponsorEntity[],
    imagesMap?: Map<number, ImageEntity[]>,
    presignedUrlsMap?: Map<number, string>,
  ): SponsorResponse[] {
    return list.map(sponsor => {
      const images = imagesMap?.get(sponsor.id);
      return this.toResponse(sponsor, images, presignedUrlsMap);
    });
  }
}
