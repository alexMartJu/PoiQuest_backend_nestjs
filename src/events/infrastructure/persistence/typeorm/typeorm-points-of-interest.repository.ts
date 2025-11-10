import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, QueryFailedError } from 'typeorm';
import { PointOfInterestEntity } from '../../../domain/entities/point-of-interest.entity';
import { PointsOfInterestRepository } from '../../../domain/repositories/points-of-interest.repository';
import { ConflictError } from '../../../../shared/errors/conflict.error';

@Injectable()
export class TypeormPointsOfInterestRepository implements PointsOfInterestRepository {
  constructor(
    @InjectRepository(PointOfInterestEntity)
    private readonly poiRepo: Repository<PointOfInterestEntity>,
  ) {}

  async findAll(): Promise<PointOfInterestEntity[]> {
    return await this.poiRepo.find({
      order: { createdAt: 'ASC' },
      where: { deletedAt: IsNull() },
      relations: ['event', 'event.category'],
    });
  }

  async findOneById(id: number): Promise<PointOfInterestEntity | null> {
    return await this.poiRepo.findOne({ 
      where: { id, deletedAt: IsNull() },
      relations: ['event', 'event.category'],
    });
  }

  async findOneByUuid(uuid: string): Promise<PointOfInterestEntity | null> {
    return await this.poiRepo.findOne({ 
      where: { uuid, deletedAt: IsNull() },
      relations: ['event', 'event.category'],
    });
  }

  async findOneByUuidIncludingDeleted(uuid: string): Promise<PointOfInterestEntity | null> {
    return await this.poiRepo.findOne({
      where: { uuid },
      withDeleted: true,
      relations: ['event', 'event.category'],
    });
  }

  async findByEventId(eventId: number): Promise<PointOfInterestEntity[]> {
    return await this.poiRepo.find({
      where: { eventId, deletedAt: IsNull() },
      order: { createdAt: 'ASC' },
    });
  }

  create(data: Partial<PointOfInterestEntity>): PointOfInterestEntity {
    return this.poiRepo.create(data);
  }

  async save(poi: PointOfInterestEntity): Promise<PointOfInterestEntity> {
    try {
      return await this.poiRepo.save(poi);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        const driverErr = (err as any).driverError;
        if (driverErr.code === 'ER_DUP_ENTRY') {
          throw new ConflictError('El QR Code o NFC Tag ya existe');
        }
      }
      throw err;
    }
  }

  async softDeleteByUuid(uuid: string): Promise<void> {
    const poi = await this.findOneByUuid(uuid);
    if (poi) {
      await this.poiRepo.softDelete(poi.id);
    }
  }
}
