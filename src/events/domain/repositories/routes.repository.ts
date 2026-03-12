import { EntityManager } from 'typeorm';
import { RouteEntity } from '../entities/route.entity';

export abstract class RoutesRepository {
  abstract findByEventId(eventId: number): Promise<RouteEntity[]>;
  abstract findOneByUuid(uuid: string): Promise<RouteEntity | null>;
  abstract findOneByUuidIncludingDeleted(uuid: string): Promise<RouteEntity | null>;
  abstract findOneByUuidWithManager(manager: EntityManager, uuid: string): Promise<RouteEntity | null>;
  abstract create(data: Partial<RouteEntity>): RouteEntity;
  abstract save(route: RouteEntity): Promise<RouteEntity>;
  abstract softDeleteByUuid(uuid: string): Promise<void>;
  abstract softDeleteByEventId(eventId: number): Promise<void>;
}
