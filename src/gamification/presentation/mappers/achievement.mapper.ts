import { AchievementEntity } from '../../domain/entities/achievement.entity';
import { AchievementAdminResponse } from '../dto/responses/achievement-admin.response.dto';

export class AchievementMapper {
  static toResponse(achievement: AchievementEntity): AchievementAdminResponse {
    return {
      uuid: achievement.uuid,
      key: achievement.key,
      name: achievement.name,
      description: achievement.description ?? null,
      category: achievement.category,
      threshold: achievement.threshold,
      points: achievement.points,
      createdAt: achievement.createdAt,
      updatedAt: achievement.updatedAt,
    };
  }

  static toResponseList(achievements: AchievementEntity[]): AchievementAdminResponse[] {
    return achievements.map(AchievementMapper.toResponse);
  }
}
