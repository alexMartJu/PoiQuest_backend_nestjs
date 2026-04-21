import { LevelEntity } from '../entities/level.entity';

export abstract class LevelsRepository {
  abstract findAll(): Promise<LevelEntity[]>;
  abstract findOneByUuid(uuid: string): Promise<LevelEntity | null>;
  abstract findOneByLevel(level: number): Promise<LevelEntity | null>;
  abstract create(data: Partial<LevelEntity>): LevelEntity;
  abstract save(level: LevelEntity): Promise<LevelEntity>;
  abstract deleteByUuid(uuid: string): Promise<void>;
}
