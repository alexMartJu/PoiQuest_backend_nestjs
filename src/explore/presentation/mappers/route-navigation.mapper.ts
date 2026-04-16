import { RouteNavigationDto } from '../../application/dto/route-navigation.dto';
import { RouteNavigationResponse } from '../dto/responses/route-navigation.response.dto';

export class RouteNavigationMapper {
  static toResponse(result: RouteNavigationDto): RouteNavigationResponse {
    return {
      uuid: result.route.uuid,
      name: result.route.name,
      pois: result.sortedPois.map(rp => ({
        uuid: rp.poi.uuid,
        title: rp.poi.title,
        coordX: rp.poi.coordX ?? null,
        coordY: rp.poi.coordY ?? null,
        sortOrder: rp.sortOrder,
        scanned: result.scannedSet.has(rp.poiId),
        qrCode: rp.poi.qrCode,
      })),
    };
  }
}
