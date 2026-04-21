import { AchievementCategory } from '../../domain/entities/achievement.entity';

export interface UpdateAchievementDto {
  key?: string;
  name?: string;
  description?: string | null;
  category?: AchievementCategory;
  threshold?: number;
  points?: number;
}
