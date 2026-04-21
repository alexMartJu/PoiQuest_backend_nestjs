import { Injectable } from '@nestjs/common';
import { GamificationRepository } from '../../domain/repositories/gamification.repository';
import { LevelsRepository } from '../../domain/repositories/levels.repository';
import { ProfileRepository } from '../../../profile/domain/repositories/profile.repository';
import { AchievementCategory } from '../../domain/entities/achievement.entity';
import { LevelEntity } from '../../domain/entities/level.entity';
import { GamificationProgressDto } from '../dto/gamification-progress.dto';
import { NotFoundError } from '../../../shared/errors/not-found.error';

@Injectable()
export class GamificationService {
  constructor(
    private readonly gamificationRepo: GamificationRepository,
    private readonly levelsRepo: LevelsRepository,
    private readonly profileRepo: ProfileRepository,
  ) {}

  /**
   * Obtiene el progreso de gamificación completo del usuario.
   */
  async getProgress(userId: number): Promise<GamificationProgressDto> {
    const profile = await this.profileRepo.findOneByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Perfil no encontrado', { userId });
    }

    // Obtener estadísticas del usuario
    const [totalScans, completedRoutes, paidTickets, usedPaidTickets] = await Promise.all([
      this.gamificationRepo.countTotalScansByProfileId(profile.id),
      this.gamificationRepo.countCompletedRoutesByProfileId(profile.id),
      this.gamificationRepo.countPaidTicketsByProfileId(profile.id),
      this.gamificationRepo.countUsedPaidTicketsByProfileId(profile.id),
    ]);

    // Obtener todos los logros y los desbloqueados
    const [achievements, userAchievements, levels] = await Promise.all([
      this.gamificationRepo.findAllAchievements(),
      this.gamificationRepo.findUserAchievementsByProfileId(profile.id),
      this.levelsRepo.findAll(),
    ]);

    const unlockedAchievementIds = userAchievements.map((ua) => ua.achievementId);

    // Calcular nivel y puntos
    const levelInfo = this.calculateLevel(profile.totalPoints, levels);
    const nextLevel = levels.find((l) => l.level === levelInfo.level + 1);
    const discount = this.getDiscountForLevel(levelInfo.level, levels);

    return {
      totalPoints: profile.totalPoints,
      level: levelInfo.level,
      levelTitle: levelInfo.title,
      currentLevelMinPoints: levelInfo.minPoints,
      nextLevelMinPoints: nextLevel?.minPoints ?? null,
      stats: {
        totalScans,
        completedRoutes,
        paidTickets,
        usedPaidTickets,
      },
      achievements,
      unlockedAchievementIds,
      discount,
      levels,
    };
  }

  /**
   * Verifica y desbloquea logros pendientes para el usuario.
   * Se llama después de acciones relevantes (escanear POI, comprar ticket, etc.)
   */
  async checkAndUnlockAchievements(userId: number): Promise<void> {
    const profile = await this.profileRepo.findOneByUserId(userId);
    if (!profile) return;

    const [totalScans, completedRoutes, paidTickets, usedPaidTickets] = await Promise.all([
      this.gamificationRepo.countTotalScansByProfileId(profile.id),
      this.gamificationRepo.countCompletedRoutesByProfileId(profile.id),
      this.gamificationRepo.countPaidTicketsByProfileId(profile.id),
      this.gamificationRepo.countUsedPaidTicketsByProfileId(profile.id),
    ]);

    const achievements = await this.gamificationRepo.findAllAchievements();
    const userAchievements = await this.gamificationRepo.findUserAchievementsByProfileId(profile.id);
    const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId));

    let pointsGained = 0;

    for (const achievement of achievements) {
      if (unlockedIds.has(achievement.id)) continue;

      const currentValue = this.getCurrentValueForAchievement(achievement.category, {
        totalScans,
        completedRoutes,
        paidTickets,
        usedPaidTickets,
      });

      if (currentValue >= achievement.threshold) {
        await this.gamificationRepo.saveUserAchievement({
          profileId: profile.id,
          achievementId: achievement.id,
        });
        pointsGained += achievement.points;
      }
    }

    // Actualizar puntos y nivel del perfil si se ganaron puntos
    if (pointsGained > 0) {
      profile.totalPoints += pointsGained;
      const levels = await this.levelsRepo.findAll();
      profile.level = this.calculateLevel(profile.totalPoints, levels).level;
      await this.profileRepo.save(profile);
    }
  }

  /**
   * Obtiene el descuento (%) que le corresponde al usuario por su nivel.
   */
  getDiscountForLevel(level: number, levels: LevelEntity[]): number {
    let discount = 0;
    for (const lvl of levels) {
      if (level >= lvl.level && lvl.discount > discount) {
        discount = lvl.discount;
      }
    }
    return discount;
  }

  /**
   * Obtiene el descuento aplicable para un usuario por su userId.
   */
  async getDiscountForUser(userId: number): Promise<number> {
    const profile = await this.profileRepo.findOneByUserId(userId);
    if (!profile) return 0;
    const levels = await this.levelsRepo.findAll();
    return this.getDiscountForLevel(profile.level, levels);
  }

  // ============ Funciones auxiliares ============

  private calculateLevel(totalPoints: number, levels: LevelEntity[]): { level: number; title: string; minPoints: number } {
    let current = { level: 1, title: 'Explorador', minPoints: 0 };
    for (const lvl of levels) {
      if (totalPoints >= lvl.minPoints) {
        current = { level: lvl.level, title: lvl.title, minPoints: lvl.minPoints };
      }
    }
    return current;
  }

  private getCurrentValueForAchievement(
    category: AchievementCategory,
    stats: { totalScans: number; completedRoutes: number; paidTickets: number; usedPaidTickets: number },
  ): number {
    switch (category) {
      case AchievementCategory.EXPLORATION:
        return stats.totalScans;
      case AchievementCategory.ROUTES:
        return stats.completedRoutes;
      case AchievementCategory.PREMIUM_EVENTS:
        // Para logros de compra se usa paidTickets, para asistencia usedPaidTickets
        // Usamos el mayor de ambos ya que los logros de compra solo necesitan paidTickets
        return stats.paidTickets;
      default:
        return 0;
    }
  }
}
