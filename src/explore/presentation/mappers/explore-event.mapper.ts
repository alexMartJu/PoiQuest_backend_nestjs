import { ExploreEventItemDto, PaginatedExploreEventsDto } from '../../application/dto/paginated-explore-events.dto';
import { ExploreEventItem, PaginatedExploreEventsResponse } from '../dto/responses/explore-event.response.dto';

export class ExploreEventMapper {
  static toResponse(
    item: ExploreEventItemDto,
    presignedUrlsMap?: Map<number, string>,
  ): ExploreEventItem {
    const primaryImageUrl = item.primaryImage
      ? presignedUrlsMap?.get(item.primaryImage.id) ?? null
      : null;

    return {
      ticketUuid: item.ticket.uuid,
      visitDate: item.ticket.visitDate,
      ticketStatus: item.ticket.status,
      event: {
        uuid: item.ticket.event.uuid,
        name: item.ticket.event.name,
        primaryImageUrl,
        cityName: item.ticket.event.city?.name ?? null,
        startDate: item.ticket.event.startDate,
        endDate: item.ticket.event.endDate ?? null,
      },
      progress: {
        totalPois: item.totalPois,
        scannedPois: item.scannedPois,
      },
    };
  }

  static toResponseList(
    items: ExploreEventItemDto[],
    presignedUrlsMap?: Map<number, string>,
  ): ExploreEventItem[] {
    return items.map(item => ExploreEventMapper.toResponse(item, presignedUrlsMap));
  }

  static toPaginatedResponse(
    result: PaginatedExploreEventsDto,
    presignedUrlsMap?: Map<number, string>,
  ): PaginatedExploreEventsResponse {
    return {
      data: ExploreEventMapper.toResponseList(result.data, presignedUrlsMap),
      nextCursor: result.nextCursor,
      hasNextPage: result.hasNextPage,
    };
  }
}
