import { PointOfInterestEntity } from '../../domain/entities/point-of-interest.entity';
import { PointOfInterestResponse } from '../dto/responses/point-of-interest.response.dto';
import { EventMapper } from './event.mapper';
import { ImageEntity } from '../../../media/domain/entities/image.entity';
import { ImageMapper } from '../../../media/presentation/mappers/image.mapper';

export class PointOfInterestMapper {
  static toResponse(poi: PointOfInterestEntity, images?: ImageEntity[]): PointOfInterestResponse {
    const response: PointOfInterestResponse = {
      uuid: poi.uuid,
      event: poi.event ? EventMapper.toResponse(poi.event) : null,
      title: poi.title,
      author: poi.author ?? null,
      description: poi.description ?? null,
      multimedia: poi.multimedia ?? null,
      qrCode: poi.qrCode,
      nfcTag: poi.nfcTag ?? null,
      coordX: poi.coordX ?? null,
      coordY: poi.coordY ?? null,
      createdAt: poi.createdAt,
      updatedAt: poi.updatedAt,
    };

    // Incluir imágenes si se proporcionan
    if (images) {
      response.images = ImageMapper.toResponseList(images);
    }

    return response;
  }

  static toResponseList(list: PointOfInterestEntity[], imagesMap?: Map<number, ImageEntity[]>): PointOfInterestResponse[] {
    return list.map(poi => {
      const images = imagesMap?.get(poi.id);
      return PointOfInterestMapper.toResponse(poi, images);
    });
  }

  /**
   * Versión simplificada sin incluir el evento completo
   * Útil para evitar referencias circulares cuando se incluyen POIs en eventos
   */
  static toResponseWithoutEvent(poi: PointOfInterestEntity, images?: ImageEntity[]): Omit<PointOfInterestResponse, 'event'> {
    const response: Omit<PointOfInterestResponse, 'event'> = {
      uuid: poi.uuid,
      title: poi.title,
      author: poi.author ?? null,
      description: poi.description ?? null,
      multimedia: poi.multimedia ?? null,
      qrCode: poi.qrCode,
      nfcTag: poi.nfcTag ?? null,
      coordX: poi.coordX ?? null,
      coordY: poi.coordY ?? null,
      createdAt: poi.createdAt,
      updatedAt: poi.updatedAt,
    };

    // Incluir imágenes si se proporcionan
    if (images) {
      response.images = ImageMapper.toResponseList(images);
    }

    return response;
  }

  static toResponseListWithoutEvent(list: PointOfInterestEntity[], imagesMap?: Map<number, ImageEntity[]>): Omit<PointOfInterestResponse, 'event'>[] {
    return list.map(poi => {
      const images = imagesMap?.get(poi.id);
      return PointOfInterestMapper.toResponseWithoutEvent(poi, images);
    });
  }
}
