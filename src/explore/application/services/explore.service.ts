import { Injectable } from '@nestjs/common';
import { ExploreRepository } from '../../domain/repositories/explore.repository';
import { ScanPoiDto } from '../dto/scan-poi.dto';
import { PaginatedExploreEventsDto } from '../dto/paginated-explore-events.dto';
import { EventProgressDto } from '../dto/event-progress.dto';
import { ScanPoiResultDto } from '../dto/scan-poi-result.dto';
import { RouteNavigationDto } from '../dto/route-navigation.dto';
import { TicketStatus } from '../../../payments/domain/entities/ticket.entity';
import { NotFoundError } from '../../../shared/errors/not-found.error';
import { ValidationError } from '../../../shared/errors/validation.error';
import { ProfileService } from '../../../profile/application/services/profile.service';
import { GamificationService } from '../../../gamification/application/services/gamification.service';

@Injectable()
export class ExploreService {
  constructor(
    private readonly exploreRepo: ExploreRepository,
    private readonly profileService: ProfileService,
    private readonly gamificationService: GamificationService,
  ) {}

  /**
   * Obtener eventos del usuario a partir de sus tickets (active o used)
   * con paginación por cursor.
   */
  async getMyEvents(
    userId: number,
    status: 'active' | 'used',
    cursor?: string,
    limit = 4,
  ): Promise<PaginatedExploreEventsDto> {
    const profile = await this.profileService.getMyProfile(userId);

    const ticketStatus = status === 'active' ? TicketStatus.ACTIVE : TicketStatus.USED;

    const { tickets, hasNextPage } = await this.exploreRepo.findTicketsByProfileWithCursor(
      profile.id,
      ticketStatus,
      cursor,
      limit,
    );

    // Obtener imágenes primarias de los eventos
    const eventIds = [...new Set(tickets.map((t) => t.event.id))];
    const primaryImages = await this.exploreRepo.findPrimaryImagesByEventIds(eventIds);
    const imagesByEventId = new Map(primaryImages.map(img => [img.imageableId, img]));

    // Calcular progreso para cada ticket
    const data = await Promise.all(
      tickets.map(async (ticket) => {
        const totalPois = await this.exploreRepo.countPoisByEventId(ticket.event.id);
        const scannedPois = await this.exploreRepo.countScansByTicketAndEventPois(
          ticket.id,
          ticket.event.id,
        );

        return {
          ticket,
          totalPois,
          scannedPois,
          primaryImage: imagesByEventId.get(ticket.event.id) ?? null,
        };
      }),
    );

    const nextCursor =
      hasNextPage && tickets.length > 0
        ? String(tickets[tickets.length - 1].id)
        : null;

    return { data, nextCursor, hasNextPage };
  }

  /**
   * Obtener progreso detallado de un evento para un ticket específico.
   */
  async getEventProgress(userId: number, eventUuid: string, visitDate: string): Promise<EventProgressDto> {
    const profile = await this.profileService.getMyProfile(userId);

    // Buscar el ticket del usuario para ese evento y fecha
    const ticket = await this.exploreRepo.findTicketByProfileAndEvent(
      profile.id,
      eventUuid,
      visitDate,
      [TicketStatus.ACTIVE, TicketStatus.USED],
    );

    if (!ticket) {
      throw new NotFoundError('Ticket no encontrado para este evento y fecha');
    }

    // Obtener imagen primaria del evento
    const primaryImage = await this.exploreRepo.findPrimaryImageByEventId(ticket.event.id);

    // Obtener todos los POIs del evento
    const allPois = await this.exploreRepo.findPoisByEventId(ticket.event.id);

    // Obtener IDs de POIs escaneados por este ticket
    const scannedPoiIds = await this.exploreRepo.findScannedPoiIdsByTicket(ticket.id);
    const scannedSet = new Set(scannedPoiIds);

    // Obtener rutas del evento con sus POIs
    const routes = await this.exploreRepo.findRoutesByEventWithPois(ticket.event.id);

    return {
      ticket,
      primaryImage,
      totalPois: allPois.length,
      scannedPois: scannedPoiIds.length,
      scannedSet,
      routes: routes
        .filter((r) => !r.deletedAt)
        .map((route) => ({
          route,
          routePois: (route.routePois || [])
            .sort((a, b) => a.sortOrder - b.sortOrder),
        })),
    };
  }

  /**
   * Escanear un POI para un ticket específico.
   */
  async scanPoi(userId: number, dto: ScanPoiDto): Promise<ScanPoiResultDto> {
    const profile = await this.profileService.getMyProfile(userId);

    // Buscar el ticket
    const ticket = await this.exploreRepo.findTicketByUuidAndProfileWithEvent(dto.ticketUuid, profile.id);

    if (!ticket) {
      throw new NotFoundError('Ticket no encontrado');
    }

    // Verificar que el ticket está usado (validado)
    if (ticket.status !== TicketStatus.USED) {
      throw new ValidationError('El ticket debe estar validado (usado) para escanear POIs');
    }

    // Verificar que hoy es el día de visita
    const today = new Date().toISOString().split('T')[0];
    if (ticket.visitDate !== today) {
      throw new ValidationError(
        `Solo puedes escanear POIs en la fecha de visita (${ticket.visitDate})`,
      );
    }

    // Buscar el POI
    const poi = await this.exploreRepo.findPoiByUuid(dto.poiUuid);

    if (!poi) {
      throw new NotFoundError('Punto de interés no encontrado');
    }

    // Verificar que el POI pertenece al mismo evento del ticket
    if (poi.eventId !== ticket.event.id) {
      throw new ValidationError('Este POI no pertenece al evento de tu ticket');
    }

    // Verificar que no se haya escaneado ya para este ticket
    const existingScan = await this.exploreRepo.findScanByTicketAndPoi(
      ticket.id,
      poi.id,
    );

    if (existingScan) {
      throw new ValidationError('Ya has escaneado este POI para esta visita');
    }

    // Crear el escaneo
    const scan = this.exploreRepo.createScan({
      profileId: profile.id,
      poiId: poi.id,
      ticketId: ticket.id,
    });

    const savedScan = await this.exploreRepo.saveScan(scan);

    // Verificar y desbloquear logros después de escanear
    await this.gamificationService.checkAndUnlockAchievements(userId);

    return { scan: savedScan, poi };
  }

  /**
   * Obtener datos de navegación de una ruta (POIs con coordenadas y estado de escaneo).
   */
  async getRouteNavigation(userId: number, routeUuid: string, ticketUuid: string): Promise<RouteNavigationDto> {
    const profile = await this.profileService.getMyProfile(userId);

    // Buscar el ticket
    const ticket = await this.exploreRepo.findTicketByUuidAndProfile(ticketUuid, profile.id);

    if (!ticket) {
      throw new NotFoundError('Ticket no encontrado');
    }

    // Buscar la ruta con sus POIs
    const route = await this.exploreRepo.findRouteByUuidWithPois(routeUuid);

    if (!route) {
      throw new NotFoundError('Ruta no encontrada');
    }

    // Obtener POIs escaneados para este ticket
    const scannedPoiIds = await this.exploreRepo.findScannedPoiIdsByTicket(ticket.id);
    const scannedSet = new Set(scannedPoiIds);

    const sortedPois = (route.routePois || []).sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );

    return { route, sortedPois, scannedSet };
  }
}
