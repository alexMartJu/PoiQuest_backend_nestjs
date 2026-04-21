import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { LevelsRepository } from '../../../domain/repositories/levels.repository';
import { LevelEntity } from '../../../domain/entities/level.entity';
import { ConflictError } from '../../../../shared/errors/conflict.error';

@Injectable()
export class TypeormLevelsRepository implements LevelsRepository {
  constructor(
    @InjectRepository(LevelEntity)
    private readonly levelRepo: Repository<LevelEntity>,
  ) {}

  async findAll(): Promise<LevelEntity[]> {
    return this.levelRepo.find({ order: { level: 'ASC' } });
  }

  async findOneByUuid(uuid: string): Promise<LevelEntity | null> {
    return this.levelRepo.findOne({ where: { uuid } });
  }

  async findOneByLevel(level: number): Promise<LevelEntity | null> {
    return this.levelRepo.findOne({ where: { level } });
  }

  create(data: Partial<LevelEntity>): LevelEntity {
    return this.levelRepo.create(data);
  }

  async save(level: LevelEntity): Promise<LevelEntity> {
    try {
      return await this.levelRepo.save(level);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        const driverErr = (err as any).driverError;
        if (driverErr?.code === 'ER_DUP_ENTRY' || driverErr?.errno === 1062 || driverErr?.code === '23505') {
          throw new ConflictError('Valor duplicado en la base de datos', { field: 'uuid, level o title' });
        }
      }
      throw err;
    }
  }

  async deleteByUuid(uuid: string): Promise<void> {
    const level = await this.findOneByUuid(uuid);
    if (level) {
      await this.levelRepo.remove(level);
    }
  }
}
