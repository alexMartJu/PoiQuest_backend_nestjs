import { ScanEntity } from '../entities/scan.entity';
import { TicketEntity, TicketStatus } from '../../../payments/domain/entities/ticket.entity';
import { PointOfInterestEntity } from '../../../events/domain/entities/point-of-interest.entity';
import { RouteEntity } from '../../../events/domain/entities/route.entity';
import { ImageEntity } from '../../../media/domain/entities/image.entity';

export abstract class ExploreRepository {
  // --- Scans ---
  abstract createScan(data: Partial<ScanEntity>): ScanEntity;
  abstract saveScan(scan: ScanEntity): Promise<ScanEntity>;
  abstract findScanByTicketAndPoi(ticketId: number, poiId: number): Promise<ScanEntity | null>;
  abstract findScansByTicketId(ticketId: number): Promise<ScanEntity[]>;
  abstract countScansByTicketAndEventPois(ticketId: number, eventId: number): Promise<number>;
  abstract countScansByTicketAndRoutePois(ticketId: number, routeId: number): Promise<number>;
  abstract findScannedPoiIdsByTicket(ticketId: number): Promise<number[]>;

  // --- Tickets ---
  abstract findTicketsByProfileWithCursor(
    profileId: number,
    status: TicketStatus,
    cursor: string | undefined,
    limit: number,
  ): Promise<{ tickets: TicketEntity[]; hasNextPage: boolean }>;

  abstract findTicketByProfileAndEvent(
    profileId: number,
    eventUuid: string,
    visitDate: string,
    statuses: TicketStatus[],
  ): Promise<TicketEntity | null>;

  abstract findTicketByUuidAndProfile(
    uuid: string,
    profileId: number,
  ): Promise<TicketEntity | null>;

  abstract findTicketByUuidAndProfileWithEvent(
    uuid: string,
    profileId: number,
  ): Promise<TicketEntity | null>;

  // --- Points of Interest ---
  abstract countPoisByEventId(eventId: number): Promise<number>;
  abstract findPoisByEventId(eventId: number): Promise<PointOfInterestEntity[]>;
  abstract findPoiByUuid(uuid: string): Promise<PointOfInterestEntity | null>;

  // --- Routes ---
  abstract findRoutesByEventWithPois(eventId: number): Promise<RouteEntity[]>;
  abstract findRouteByUuidWithPois(uuid: string): Promise<RouteEntity | null>;

  // --- Images ---
  abstract findPrimaryImagesByEventIds(eventIds: number[]): Promise<ImageEntity[]>;
  abstract findPrimaryImageByEventId(eventId: number): Promise<ImageEntity | null>;
}
