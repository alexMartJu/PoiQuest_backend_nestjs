import { EventProgressDto, RouteProgressItemDto } from '../../application/dto/event-progress.dto';
import { EventProgressResponse, ProgressRouteItem } from '../dto/responses/event-progress.response.dto';

export class EventProgressMapper {
  static toResponse(
    result: EventProgressDto,
    presignedUrlsMap?: Map<number, string>,
  ): EventProgressResponse {
    const primaryImageUrl = result.primaryImage
      ? presignedUrlsMap?.get(result.primaryImage.id) ?? null
      : null;

    return {
      ticketUuid: result.ticket.uuid,
      visitDate: result.ticket.visitDate,
      ticketStatus: result.ticket.status,
      event: {
        uuid: result.ticket.event.uuid,
        name: result.ticket.event.name,
        description: result.ticket.event.description ?? null,
        primaryImageUrl,
        cityName: result.ticket.event.city?.name ?? null,
        startDate: result.ticket.event.startDate,
        endDate: result.ticket.event.endDate ?? null,
      },
      totalPois: result.totalPois,
      scannedPois: result.scannedPois,
      routes: result.routes.map(r =>
        EventProgressMapper.toRouteProgress(r, result.scannedSet),
      ),
    };
  }

  private static toRouteProgress(
    item: RouteProgressItemDto,
    scannedSet: Set<number>,
  ): ProgressRouteItem {
    const scannedCount = item.routePois.filter(rp => scannedSet.has(rp.poiId)).length;
    return {
      uuid: item.route.uuid,
      name: item.route.name,
      description: item.route.description ?? null,
      totalPois: item.routePois.length,
      scannedPois: scannedCount,
      pois: item.routePois.map(rp => ({
        uuid: rp.poi.uuid,
        title: rp.poi.title,
        sortOrder: rp.sortOrder,
        scanned: scannedSet.has(rp.poiId),
        coordX: rp.poi.coordX ?? null,
        coordY: rp.poi.coordY ?? null,
      })),
    };
  }
}
