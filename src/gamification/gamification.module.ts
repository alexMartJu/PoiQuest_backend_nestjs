import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AchievementEntity } from './domain/entities/achievement.entity';
import { UserAchievementEntity } from './domain/entities/user-achievement.entity';
import { LevelEntity } from './domain/entities/level.entity';
import { ScanEntity } from '../explore/domain/entities/scan.entity';
import { TicketEntity } from '../payments/domain/entities/ticket.entity';
import { RouteEntity } from '../events/domain/entities/route.entity';
import { GamificationController } from './presentation/controllers/gamification.controller';
import { LevelsController } from './presentation/controllers/levels.controller';
import { AchievementsController } from './presentation/controllers/achievements.controller';
import { GamificationService } from './application/services/gamification.service';
import { LevelsService } from './application/services/levels.service';
import { AchievementsService } from './application/services/achievements.service';
import { GamificationRepository } from './domain/repositories/gamification.repository';
import { TypeormGamificationRepository } from './infrastructure/persistence/typeorm/typeorm-gamification.repository';
import { LevelsRepository } from './domain/repositories/levels.repository';
import { TypeormLevelsRepository } from './infrastructure/persistence/typeorm/typeorm-levels.repository';
import { AchievementsRepository } from './domain/repositories/achievements.repository';
import { TypeormAchievementsRepository } from './infrastructure/persistence/typeorm/typeorm-achievements.repository';
import { ProfileModule } from '../profile/profile.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AchievementEntity,
      UserAchievementEntity,
      LevelEntity,
      ScanEntity,
      TicketEntity,
      RouteEntity,
    ]),
    ProfileModule,
  ],
  controllers: [GamificationController, LevelsController, AchievementsController],
  providers: [
    GamificationService,
    LevelsService,
    AchievementsService,
    { provide: GamificationRepository, useClass: TypeormGamificationRepository },
    { provide: LevelsRepository, useClass: TypeormLevelsRepository },
    { provide: AchievementsRepository, useClass: TypeormAchievementsRepository },
  ],
  exports: [GamificationService],
})
export class GamificationModule {}
