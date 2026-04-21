import { Injectable } from '@nestjs/common';
import { LevelsRepository } from '../../domain/repositories/levels.repository';
import { LevelEntity } from '../../domain/entities/level.entity';
import { CreateLevelDto } from '../dto/create-level.dto';
import { UpdateLevelDto } from '../dto/update-level.dto';
import { NotFoundError } from '../../../shared/errors/not-found.error';

@Injectable()
export class LevelsService {
  constructor(private readonly levelsRepo: LevelsRepository) {}

  async findAll(): Promise<LevelEntity[]> {
    return this.levelsRepo.findAll();
  }

  async findOneByUuid(uuid: string): Promise<LevelEntity> {
    const level = await this.levelsRepo.findOneByUuid(uuid);
    if (!level) {
      throw new NotFoundError('Nivel no encontrado');
    }
    return level;
  }

  async createLevel(dto: CreateLevelDto): Promise<LevelEntity> {
    const level = this.levelsRepo.create({
      level: dto.level,
      title: dto.title,
      minPoints: dto.minPoints,
      discount: dto.discount ?? 0,
      reward: dto.reward ?? null,
    });
    return this.levelsRepo.save(level);
  }

  async updateByUuid(uuid: string, dto: UpdateLevelDto): Promise<LevelEntity> {
    const level = await this.levelsRepo.findOneByUuid(uuid);
    if (!level) {
      throw new NotFoundError('Nivel no encontrado');
    }
    if (dto.level !== undefined) level.level = dto.level;
    if (dto.title !== undefined) level.title = dto.title;
    if (dto.minPoints !== undefined) level.minPoints = dto.minPoints;
    if (dto.discount !== undefined) level.discount = dto.discount;
    if (dto.reward !== undefined) level.reward = dto.reward ?? null;
    return this.levelsRepo.save(level);
  }

  async removeByUuid(uuid: string): Promise<void> {
    const level = await this.levelsRepo.findOneByUuid(uuid);
    if (!level) {
      throw new NotFoundError('Nivel no encontrado');
    }
    await this.levelsRepo.deleteByUuid(uuid);
  }
}
