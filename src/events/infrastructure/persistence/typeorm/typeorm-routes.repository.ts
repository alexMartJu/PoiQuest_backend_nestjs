import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, IsNull, Repository } from 'typeorm';
import { RoutesRepository } from '../../../domain/repositories/routes.repository';
import { RouteEntity } from '../../../domain/entities/route.entity';

@Injectable()
export class TypeormRoutesRepository implements RoutesRepository {
  constructor(
    @InjectRepository(RouteEntity)
    private readonly routeRepo: Repository<RouteEntity>,
  ) {}

  async findByEventId(eventId: number): Promise<RouteEntity[]> {
    return await this.routeRepo.find({
      where: { eventId, deletedAt: IsNull() },
      relations: ['routePois', 'routePois.poi'],
      order: { createdAt: 'ASC' },
    });
  }

  async findOneByUuid(uuid: string): Promise<RouteEntity | null> {
    return await this.routeRepo.findOne({
      where: { uuid, deletedAt: IsNull() },
      relations: ['routePois', 'routePois.poi', 'event'],
    });
  }

  async findOneByUuidIncludingDeleted(uuid: string): Promise<RouteEntity | null> {
    return await this.routeRepo.findOne({
      where: { uuid },
      withDeleted: true,
    });
  }

  async findOneByUuidWithManager(manager: EntityManager, uuid: string): Promise<RouteEntity | null> {
    return await manager.getRepository(RouteEntity).findOne({
      where: { uuid, deletedAt: IsNull() },
      relations: ['routePois', 'routePois.poi', 'event'],
    });
  }

  create(data: Partial<RouteEntity>): RouteEntity {
    return this.routeRepo.create(data);
  }

  async save(route: RouteEntity): Promise<RouteEntity> {
    return await this.routeRepo.save(route);
  }

  async softDeleteByUuid(uuid: string): Promise<void> {
    const route = await this.findOneByUuidIncludingDeleted(uuid);
    if (route && !route.deletedAt) {
      await this.routeRepo.softDelete(route.id);
    }
  }

  async softDeleteByEventId(eventId: number): Promise<void> {
    // Soft-delete todas las rutas no eliminadas del evento
    await this.routeRepo
      .createQueryBuilder()
      .softDelete()
      .where('event_id = :eventId AND deleted_at IS NULL', { eventId })
      .execute();
  }
}
