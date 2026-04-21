import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { AchievementsRepository } from '../../../domain/repositories/achievements.repository';
import { AchievementEntity } from '../../../domain/entities/achievement.entity';
import { ConflictError } from '../../../../shared/errors/conflict.error';

@Injectable()
export class TypeormAchievementsRepository implements AchievementsRepository {
  constructor(
    @InjectRepository(AchievementEntity)
    private readonly achievementRepo: Repository<AchievementEntity>,
  ) {}

  async findAll(): Promise<AchievementEntity[]> {
    return this.achievementRepo.find({ order: { category: 'ASC', threshold: 'ASC' } });
  }

  async findOneByUuid(uuid: string): Promise<AchievementEntity | null> {
    return this.achievementRepo.findOne({ where: { uuid } });
  }

  async findOneByKey(key: string): Promise<AchievementEntity | null> {
    return this.achievementRepo.findOne({ where: { key } });
  }

  create(data: Partial<AchievementEntity>): AchievementEntity {
    return this.achievementRepo.create(data);
  }

  async save(achievement: AchievementEntity): Promise<AchievementEntity> {
    try {
      return await this.achievementRepo.save(achievement);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        const driverErr = (err as any).driverError;
        if (driverErr?.code === 'ER_DUP_ENTRY' || driverErr?.errno === 1062 || driverErr?.code === '23505') {
          throw new ConflictError('Valor duplicado en la base de datos', { field: 'uuid o key' });
        }
      }
      throw err;
    }
  }

  async deleteByUuid(uuid: string): Promise<void> {
    const achievement = await this.findOneByUuid(uuid);
    if (achievement) {
      await this.achievementRepo.remove(achievement);
    }
  }
}
