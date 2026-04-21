import { AchievementEntity } from '../entities/achievement.entity';
import { UserAchievementEntity } from '../entities/user-achievement.entity';

export abstract class GamificationRepository {
  abstract findAllAchievements(): Promise<AchievementEntity[]>;
  abstract findUserAchievementsByProfileId(profileId: number): Promise<UserAchievementEntity[]>;
  abstract findUserAchievement(profileId: number, achievementId: number): Promise<UserAchievementEntity | null>;
  abstract saveUserAchievement(data: Partial<UserAchievementEntity>): Promise<UserAchievementEntity>;

  // Stats
  abstract countTotalScansByProfileId(profileId: number): Promise<number>;
  abstract countCompletedRoutesByProfileId(profileId: number): Promise<number>;
  abstract countPaidTicketsByProfileId(profileId: number): Promise<number>;
  abstract countUsedPaidTicketsByProfileId(profileId: number): Promise<number>;
}
