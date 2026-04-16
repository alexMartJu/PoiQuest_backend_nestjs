import { RouteEntity } from '../../../events/domain/entities/route.entity';
import { RoutePoiEntity } from '../../../events/domain/entities/route-poi.entity';

export interface RouteNavigationDto {
  route: RouteEntity;
  sortedPois: RoutePoiEntity[];
  scannedSet: Set<number>;
}
