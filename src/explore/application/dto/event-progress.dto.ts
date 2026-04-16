import { TicketEntity } from '../../../payments/domain/entities/ticket.entity';
import { RouteEntity } from '../../../events/domain/entities/route.entity';
import { RoutePoiEntity } from '../../../events/domain/entities/route-poi.entity';
import { ImageEntity } from '../../../media/domain/entities/image.entity';

export interface RouteProgressItemDto {
  route: RouteEntity;
  routePois: RoutePoiEntity[];
}

export interface EventProgressDto {
  ticket: TicketEntity;
  primaryImage: ImageEntity | null;
  totalPois: number;
  scannedPois: number;
  scannedSet: Set<number>;
  routes: RouteProgressItemDto[];
}
