import { PointOfInterestEntity } from '../entities/point-of-interest.entity';

export abstract class PointsOfInterestRepository {
  abstract findAll(): Promise<PointOfInterestEntity[]>;
  abstract findOneById(id: number): Promise<PointOfInterestEntity | null>;
  abstract findOneByUuid(uuid: string): Promise<PointOfInterestEntity | null>;
  abstract findOneByUuidIncludingDeleted(uuid: string): Promise<PointOfInterestEntity | null>;
  abstract findByEventId(eventId: number): Promise<PointOfInterestEntity[]>;
  abstract create(data: Partial<PointOfInterestEntity>): PointOfInterestEntity;
  abstract save(poi: PointOfInterestEntity): Promise<PointOfInterestEntity>;
  abstract softDeleteByUuid(uuid: string): Promise<void>;
}
