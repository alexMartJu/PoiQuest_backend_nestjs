import { PointOfInterestEntity } from '../../domain/entities/point-of-interest.entity';
import { PointOfInterestResponse } from '../dto/responses/point-of-interest.response.dto';
import { EventMapper } from './event.mapper';

export class PointOfInterestMapper {
  static toResponse(poi: PointOfInterestEntity): PointOfInterestResponse {
    return {
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
  }

  static toResponseList(list: PointOfInterestEntity[]): PointOfInterestResponse[] {
    return list.map(PointOfInterestMapper.toResponse);
  }

  /**
   * Versión simplificada sin incluir el evento completo
   * Útil para evitar referencias circulares cuando se incluyen POIs en eventos
   */
  static toResponseWithoutEvent(poi: PointOfInterestEntity): Omit<PointOfInterestResponse, 'event'> {
    return {
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
  }

  static toResponseListWithoutEvent(list: PointOfInterestEntity[]): Omit<PointOfInterestResponse, 'event'>[] {
    return list.map(PointOfInterestMapper.toResponseWithoutEvent);
  }
}
