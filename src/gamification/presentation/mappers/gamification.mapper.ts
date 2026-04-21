import { GamificationProgressDto } from '../../application/dto/gamification-progress.dto';
import { GamificationProgressResponse, AchievementResponse, LevelInfoResponse } from '../dto/responses/gamification-progress.response.dto';

export class GamificationMapper {
  static toResponse(dto: GamificationProgressDto): GamificationProgressResponse {
    return {
      totalPoints: dto.totalPoints,
      level: dto.level,
      levelTitle: dto.levelTitle,
      currentLevelMinPoints: dto.currentLevelMinPoints,
      nextLevelMinPoints: dto.nextLevelMinPoints,
      discount: dto.discount,
      stats: {
        totalScans: dto.stats.totalScans,
        completedRoutes: dto.stats.completedRoutes,
        paidTickets: dto.stats.paidTickets,
        usedPaidTickets: dto.stats.usedPaidTickets,
      },
      achievements: dto.achievements.map((a): AchievementResponse => ({
        id: a.id,
        key: a.key,
        name: a.name,
        description: a.description ?? null,
        category: a.category,
        threshold: a.threshold,
        points: a.points,
        unlocked: dto.unlockedAchievementIds.includes(a.id),
      })),
      levels: dto.levels.map((l): LevelInfoResponse => ({
        level: l.level,
        title: l.title,
        minPoints: l.minPoints,
        discount: l.discount,
        reward: l.reward ?? null,
      })),
    };
  }
}
