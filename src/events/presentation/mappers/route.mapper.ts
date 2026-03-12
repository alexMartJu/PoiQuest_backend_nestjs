import { RouteEntity } from '../../domain/entities/route.entity';
import { RouteResponse, RoutePoiResponse } from '../dto/responses/route.response.dto';
import { RouteSummaryResponse } from '../dto/responses/route-summary.response.dto';
import { PointOfInterestMapper } from './point-of-interest.mapper';

export class RouteMapper {
  static toResponse(route: RouteEntity): RouteResponse {
    const pois: RoutePoiResponse[] = (route.routePois ?? [])
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(rp => ({
        sortOrder: rp.sortOrder,
        poi: PointOfInterestMapper.toResponseWithoutEvent(rp.poi),
      }));

    return {
      uuid: route.uuid,
      name: route.name,
      description: route.description ?? null,
      pois,
      createdAt: route.createdAt,
      updatedAt: route.updatedAt,
    };
  }

  static toResponseList(list: RouteEntity[]): RouteResponse[] {
    return list.map(r => RouteMapper.toResponse(r));
  }

  static toSummary(route: RouteEntity): RouteSummaryResponse {
    return {
      uuid: route.uuid,
      name: route.name,
    };
  }

  static toSummaryList(list: RouteEntity[]): RouteSummaryResponse[] {
    return list.map(r => RouteMapper.toSummary(r));
  }
}
