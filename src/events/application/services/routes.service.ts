import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RoutesRepository } from '../../domain/repositories/routes.repository';
import { EventsRepository } from '../../domain/repositories/events.repository';
import { PointsOfInterestRepository } from '../../domain/repositories/points-of-interest.repository';
import { RouteEntity } from '../../domain/entities/route.entity';
import { RoutePoiEntity } from '../../domain/entities/route-poi.entity';
import { PointOfInterestEntity } from '../../domain/entities/point-of-interest.entity';
import { EventStatus } from '../../domain/enums/event-status.enum';
import { CreateRouteDto } from '../dto/create-route.dto';
import { UpdateRouteDto } from '../dto/update-route.dto';
import { NotFoundError } from '../../../shared/errors/not-found.error';
import { ValidationError } from '../../../shared/errors/validation.error';

@Injectable()
export class RoutesService {
  constructor(
    private readonly routesRepo: RoutesRepository,
    private readonly eventsRepo: EventsRepository,
    private readonly poisRepo: PointsOfInterestRepository,
    private readonly dataSource: DataSource,
  ) {}

  /// Obtiene todas las rutas de un evento activo o pendiente por su uuid
  async findByEventUuid(eventUuid: string): Promise<RouteEntity[]> {
    const event = await this.eventsRepo.findOneByUuidIncludingDeleted(eventUuid);
    if (!event || event.deletedAt) {
      throw new NotFoundError('Evento no encontrado', { eventUuid });
    }
    if (event.status === EventStatus.FINISHED) {
      throw new ValidationError('El evento está finalizado', { eventUuid });
    }
    return await this.routesRepo.findByEventId(event.id);
  }

  /// Obtiene el detalle de una ruta por su uuid (sin importar estado del evento)
  async findOneByUuid(uuid: string): Promise<RouteEntity> {
    const route = await this.routesRepo.findOneByUuid(uuid);
    if (!route) {
      throw new NotFoundError('Ruta no encontrada', { uuid });
    }
    return route;
  }

  /// Crea una nueva ruta para un evento (admin)
  async createRoute(dto: CreateRouteDto): Promise<RouteEntity> {
    const event = await this.eventsRepo.findOneByUuidIncludingDeleted(dto.eventUuid);
    if (!event || event.deletedAt) {
      throw new NotFoundError('Evento no encontrado', { eventUuid: dto.eventUuid });
    }
    if (event.status === EventStatus.FINISHED) {
      throw new ValidationError('No se pueden crear rutas en eventos finalizados');
    }

    if (dto.poiUuids.length < 2) {
      throw new ValidationError(
        'La ruta debe tener al menos 2 puntos de interés',
        { count: dto.poiUuids.length },
      );
    }

    const pois = await this.validatePoisForEvent(dto.poiUuids, event.id);

    return await this.dataSource.transaction(async (manager) => {
      const route = this.routesRepo.create({
        eventId: event.id,
        name: dto.name,
        description: dto.description ?? null,
      });
      const saved = await manager.save(RouteEntity, route);

      for (let i = 0; i < pois.length; i++) {
        const rp = manager.getRepository(RoutePoiEntity).create({
          routeId: saved.id,
          poiId: pois[i].id,
          sortOrder: i + 1,
        });
        await manager.save(RoutePoiEntity, rp);
      }

      const loaded = await this.routesRepo.findOneByUuidWithManager(manager, saved.uuid);
      if (!loaded) {
        throw new NotFoundError('Ruta creada no encontrada después de guardar', { uuid: saved.uuid });
      }
      return loaded;
    });
  }

  /// Actualiza una ruta por uuid (admin). Permite reordenar POIs pasando la lista en nuevo orden.
  async updateByUuid(uuid: string, dto: UpdateRouteDto): Promise<RouteEntity> {
    const route = await this.routesRepo.findOneByUuidIncludingDeleted(uuid);
    if (!route || route.deletedAt) {
      throw new NotFoundError('Ruta no encontrada', { uuid });
    }

    const event = await this.eventsRepo.findOneById(route.eventId);
    if (!event || event.status === EventStatus.FINISHED) {
      throw new ValidationError('No se pueden modificar rutas de eventos finalizados');
    }

    if (dto.poiUuids !== undefined && dto.poiUuids.length < 2) {
      throw new ValidationError(
        'La ruta debe tener al menos 2 puntos de interés',
        { count: dto.poiUuids.length },
      );
    }

    const pois = dto.poiUuids !== undefined
      ? await this.validatePoisForEvent(dto.poiUuids, route.eventId)
      : null;

    return await this.dataSource.transaction(async (manager) => {
      if (dto.name !== undefined) route.name = dto.name;
      if (dto.description !== undefined) route.description = dto.description ?? null;
      await manager.save(RouteEntity, route);

      if (pois !== null) {
        // Reemplazar los route_poi existentes
        await manager.getRepository(RoutePoiEntity).delete({ routeId: route.id });
        for (let i = 0; i < pois.length; i++) {
          const rp = manager.getRepository(RoutePoiEntity).create({
            routeId: route.id,
            poiId: pois[i].id,
            sortOrder: i + 1,
          });
          await manager.save(RoutePoiEntity, rp);
        }
      }

      const loaded = await this.routesRepo.findOneByUuidWithManager(manager, route.uuid);
      if (!loaded) {
        throw new NotFoundError('Ruta no encontrada después de actualizar', { uuid });
      }
      return loaded;
    });
  }

  /// Elimina una ruta con soft delete (admin)
  async removeByUuid(uuid: string): Promise<void> {
    const route = await this.routesRepo.findOneByUuidIncludingDeleted(uuid);
    if (!route) {
      throw new NotFoundError('Ruta no encontrada', { uuid });
    }
    if (route.deletedAt) {
      throw new NotFoundError('Ruta no encontrada', { uuid });
    }
    await this.routesRepo.softDeleteByUuid(uuid);
  }

  // ============ Funciones auxiliares ============

  /// Valida que los UUIDs de POIs existen, no están eliminados y pertenecen al evento.
  /// Lanza errores si hay duplicados, POIs inexistentes o ajenos al evento.
  private async validatePoisForEvent(
    poiUuids: string[],
    eventId: number,
  ): Promise<PointOfInterestEntity[]> {
    // Verificar duplicados
    const uniqueUuids = new Set(poiUuids);
    if (uniqueUuids.size !== poiUuids.length) {
      throw new ValidationError('No se pueden repetir POIs en una ruta');
    }

    const pois: PointOfInterestEntity[] = [];
    for (const poiUuid of poiUuids) {
      const poi = await this.poisRepo.findOneByUuid(poiUuid);
      if (!poi) {
        throw new NotFoundError(`POI con UUID ${poiUuid} no encontrado`, { poiUuid });
      }
      if (poi.eventId !== eventId) {
        throw new ValidationError(
          `El POI ${poiUuid} no pertenece al evento`,
          { poiUuid },
        );
      }
      pois.push(poi);
    }
    return pois;
  }
}
