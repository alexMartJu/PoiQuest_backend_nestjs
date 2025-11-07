import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, QueryFailedError } from 'typeorm';
import { EventCategoriesRepository } from '../../../domain/repositories/event-categories.repository';
import { EventCategoryEntity } from '../../../domain/entities/event-category.entity';
import { ConflictError } from '../../../../shared/errors/conflict.error';

@Injectable()
export class TypeormEventCategoriesRepository implements EventCategoriesRepository {
  constructor(
    @InjectRepository(EventCategoryEntity)
    private readonly categoryRepo: Repository<EventCategoryEntity>,
  ) {}

  async findAll(): Promise<EventCategoryEntity[]> {
    return await this.categoryRepo.find({
      order: { createdAt: 'ASC' },
      where: { deletedAt: IsNull() },
    });
  }

  async findOneById(id: number): Promise<EventCategoryEntity | null> {
    return await this.categoryRepo.findOne({ 
      where: { id, deletedAt: IsNull() }
    });
  }

  async findOneByUuid(uuid: string): Promise<EventCategoryEntity | null> {
    return await this.categoryRepo.findOne({ 
      where: { uuid, deletedAt: IsNull() }
    });
  }

  async findOneByUuidIncludingDeleted(uuid: string): Promise<EventCategoryEntity | null> {
    return await this.categoryRepo.findOne({
      where: { uuid },
      withDeleted: true,
    });
  }

  create(data: Partial<EventCategoryEntity>): EventCategoryEntity {
    return this.categoryRepo.create(data);
  }

  async save(category: EventCategoryEntity): Promise<EventCategoryEntity> {
    try {
      return await this.categoryRepo.save(category);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        const driverErr = (err as any).driverError;
        if (driverErr?.code === 'ER_DUP_ENTRY' || driverErr?.errno === 1062 || driverErr?.code === '23505') {
          throw new ConflictError('Valor duplicado en la base de datos', { field: 'uuid o name' });
        }
      }
      throw err;
    }
  }

  async softDeleteByUuid(uuid: string): Promise<void> {
    const category = await this.findOneByUuid(uuid);
    if (category) {
      await this.categoryRepo.softDelete(category.id);
    }
  }
}
