import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScanEntity } from '../../../domain/entities/scan.entity';
import { ExploreRepository } from '../../../domain/repositories/explore.repository';
import { TicketEntity, TicketStatus } from '../../../../payments/domain/entities/ticket.entity';
import { PointOfInterestEntity } from '../../../../events/domain/entities/point-of-interest.entity';
import { RouteEntity } from '../../../../events/domain/entities/route.entity';
import { ImageEntity } from '../../../../media/domain/entities/image.entity';
import { ImageableType } from '../../../../media/domain/enums/imageable-type.enum';

@Injectable()
export class TypeormExploreRepository implements ExploreRepository {
  constructor(
    @InjectRepository(ScanEntity)
    private readonly scanRepo: Repository<ScanEntity>,
    @InjectRepository(TicketEntity)
    private readonly ticketRepo: Repository<TicketEntity>,
    @InjectRepository(PointOfInterestEntity)
    private readonly poiRepo: Repository<PointOfInterestEntity>,
    @InjectRepository(RouteEntity)
    private readonly routeRepo: Repository<RouteEntity>,
    @InjectRepository(ImageEntity)
    private readonly imageRepo: Repository<ImageEntity>,
  ) {}

  // --- Scans ---

  createScan(data: Partial<ScanEntity>): ScanEntity {
    return this.scanRepo.create(data);
  }

  async saveScan(scan: ScanEntity): Promise<ScanEntity> {
    return this.scanRepo.save(scan);
  }

  async findScanByTicketAndPoi(ticketId: number, poiId: number): Promise<ScanEntity | null> {
    return this.scanRepo.findOne({
      where: { ticketId, poiId },
    });
  }

  async findScansByTicketId(ticketId: number): Promise<ScanEntity[]> {
    return this.scanRepo.find({
      where: { ticketId },
      relations: ['poi'],
    });
  }

  async countScansByTicketAndEventPois(ticketId: number, eventId: number): Promise<number> {
    return this.scanRepo
      .createQueryBuilder('scan')
      .innerJoin('scan.poi', 'poi')
      .where('scan.ticketId = :ticketId', { ticketId })
      .andWhere('poi.eventId = :eventId', { eventId })
      .getCount();
  }

  async countScansByTicketAndRoutePois(ticketId: number, routeId: number): Promise<number> {
    return this.scanRepo
      .createQueryBuilder('scan')
      .innerJoin('route_poi', 'rp', 'rp.poi_id = scan.poi_id')
      .where('scan.ticketId = :ticketId', { ticketId })
      .andWhere('rp.route_id = :routeId', { routeId })
      .getCount();
  }

  async findScannedPoiIdsByTicket(ticketId: number): Promise<number[]> {
    const scans = await this.scanRepo.find({
      where: { ticketId },
      select: ['poiId'],
    });
    return scans.map((s) => s.poiId);
  }

  // --- Tickets ---

  async findTicketsByProfileWithCursor(
    profileId: number,
    status: TicketStatus,
    cursor: string | undefined,
    limit: number,
  ): Promise<{ tickets: TicketEntity[]; hasNextPage: boolean }> {
    const qb = this.ticketRepo
      .createQueryBuilder('ticket')
      .innerJoinAndSelect('ticket.event', 'event')
      .leftJoinAndSelect('event.city', 'city')
      .where('ticket.profileId = :profileId', { profileId })
      .andWhere('ticket.status = :status', { status })
      .andWhere('event.deletedAt IS NULL')
      .orderBy('ticket.id', 'DESC');

    if (cursor) {
      const cursorId = parseInt(cursor, 10);
      if (!isNaN(cursorId)) {
        qb.andWhere('ticket.id < :cursorId', { cursorId });
      }
    }

    const tickets = await qb.take(limit + 1).getMany();
    const hasNextPage = tickets.length > limit;
    if (hasNextPage) tickets.pop();

    return { tickets, hasNextPage };
  }

  async findTicketByProfileAndEvent(
    profileId: number,
    eventUuid: string,
    visitDate: string,
    statuses: TicketStatus[],
  ): Promise<TicketEntity | null> {
    return this.ticketRepo
      .createQueryBuilder('ticket')
      .innerJoinAndSelect('ticket.event', 'event')
      .leftJoinAndSelect('event.city', 'city')
      .where('ticket.profileId = :profileId', { profileId })
      .andWhere('event.uuid = :eventUuid', { eventUuid })
      .andWhere('ticket.visitDate = :visitDate', { visitDate })
      .andWhere('ticket.status IN (:...statuses)', { statuses })
      .getOne();
  }

  async findTicketByUuidAndProfile(
    uuid: string,
    profileId: number,
  ): Promise<TicketEntity | null> {
    return this.ticketRepo.findOne({
      where: { uuid, profileId },
    });
  }

  async findTicketByUuidAndProfileWithEvent(
    uuid: string,
    profileId: number,
  ): Promise<TicketEntity | null> {
    return this.ticketRepo.findOne({
      where: { uuid, profileId },
      relations: ['event'],
    });
  }

  // --- Points of Interest ---

  async countPoisByEventId(eventId: number): Promise<number> {
    return this.poiRepo.count({
      where: { eventId },
    });
  }

  async findPoisByEventId(eventId: number): Promise<PointOfInterestEntity[]> {
    return this.poiRepo.find({
      where: { eventId },
    });
  }

  async findPoiByUuid(uuid: string): Promise<PointOfInterestEntity | null> {
    return this.poiRepo.findOne({
      where: { uuid },
    });
  }

  // --- Routes ---

  async findRoutesByEventWithPois(eventId: number): Promise<RouteEntity[]> {
    return this.routeRepo.find({
      where: { eventId },
      relations: ['routePois', 'routePois.poi'],
      order: { id: 'ASC' },
    });
  }

  async findRouteByUuidWithPois(uuid: string): Promise<RouteEntity | null> {
    return this.routeRepo.findOne({
      where: { uuid },
      relations: ['routePois', 'routePois.poi'],
    });
  }

  // --- Images ---

  async findPrimaryImagesByEventIds(eventIds: number[]): Promise<ImageEntity[]> {
    if (eventIds.length === 0) return [];
    return this.imageRepo
      .createQueryBuilder('image')
      .where('image.imageableType = :type', { type: ImageableType.EVENT })
      .andWhere('image.imageableId IN (:...eventIds)', { eventIds })
      .andWhere('image.isPrimary = true')
      .getMany();
  }

  async findPrimaryImageByEventId(eventId: number): Promise<ImageEntity | null> {
    return this.imageRepo.findOne({
      where: {
        imageableType: ImageableType.EVENT,
        imageableId: eventId,
        isPrimary: true,
      },
    });
  }
}
