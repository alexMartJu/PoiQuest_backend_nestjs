import { AchievementEntity } from '../../domain/entities/achievement.entity';
import { LevelEntity } from '../../domain/entities/level.entity';

/**
 * DTO interno de la capa de aplicación que encapsula el resultado compuesto
 * de `GamificationService.getProgress()`. Combina datos calculados con las
 * entidades de dominio para que el mapper de presentación pueda construir
 * la respuesta sin acceder directamente a la capa de datos.
 */
export interface GamificationProgressDto {
  totalPoints: number;
  level: number;
  levelTitle: string;
  currentLevelMinPoints: number;
  nextLevelMinPoints: number | null;
  stats: {
    totalScans: number;
    completedRoutes: number;
    paidTickets: number;
    usedPaidTickets: number;
  };
  achievements: AchievementEntity[];
  unlockedAchievementIds: number[];
  discount: number;
  levels: LevelEntity[];
}
