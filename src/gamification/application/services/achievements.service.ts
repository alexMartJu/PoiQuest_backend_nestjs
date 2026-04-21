import { Injectable } from '@nestjs/common';
import { AchievementsRepository } from '../../domain/repositories/achievements.repository';
import { AchievementEntity } from '../../domain/entities/achievement.entity';
import { CreateAchievementDto } from '../dto/create-achievement.dto';
import { UpdateAchievementDto } from '../dto/update-achievement.dto';
import { NotFoundError } from '../../../shared/errors/not-found.error';

@Injectable()
export class AchievementsService {
  constructor(private readonly achievementsRepo: AchievementsRepository) {}

  async findAll(): Promise<AchievementEntity[]> {
    return this.achievementsRepo.findAll();
  }

  async findOneByUuid(uuid: string): Promise<AchievementEntity> {
    const achievement = await this.achievementsRepo.findOneByUuid(uuid);
    if (!achievement) {
      throw new NotFoundError('Logro no encontrado');
    }
    return achievement;
  }

  async createAchievement(dto: CreateAchievementDto): Promise<AchievementEntity> {
    const achievement = this.achievementsRepo.create({
      key: dto.key,
      name: dto.name,
      description: dto.description ?? null,
      category: dto.category,
      threshold: dto.threshold,
      points: dto.points,
    });
    return this.achievementsRepo.save(achievement);
  }

  async updateByUuid(uuid: string, dto: UpdateAchievementDto): Promise<AchievementEntity> {
    const achievement = await this.achievementsRepo.findOneByUuid(uuid);
    if (!achievement) {
      throw new NotFoundError('Logro no encontrado');
    }
    if (dto.key !== undefined) achievement.key = dto.key;
    if (dto.name !== undefined) achievement.name = dto.name;
    if (dto.description !== undefined) achievement.description = dto.description ?? null;
    if (dto.category !== undefined) achievement.category = dto.category;
    if (dto.threshold !== undefined) achievement.threshold = dto.threshold;
    if (dto.points !== undefined) achievement.points = dto.points;
    return this.achievementsRepo.save(achievement);
  }

  async removeByUuid(uuid: string): Promise<void> {
    const achievement = await this.achievementsRepo.findOneByUuid(uuid);
    if (!achievement) {
      throw new NotFoundError('Logro no encontrado');
    }
    await this.achievementsRepo.deleteByUuid(uuid);
  }
}
