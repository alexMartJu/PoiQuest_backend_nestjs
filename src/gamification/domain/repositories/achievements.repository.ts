import { AchievementEntity } from '../entities/achievement.entity';

export abstract class AchievementsRepository {
  abstract findAll(): Promise<AchievementEntity[]>;
  abstract findOneByUuid(uuid: string): Promise<AchievementEntity | null>;
  abstract findOneByKey(key: string): Promise<AchievementEntity | null>;
  abstract create(data: Partial<AchievementEntity>): AchievementEntity;
  abstract save(achievement: AchievementEntity): Promise<AchievementEntity>;
  abstract deleteByUuid(uuid: string): Promise<void>;
}
