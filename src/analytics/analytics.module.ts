import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/domain/entities/user.entity';
import { EventEntity } from '../events/domain/entities/event.entity';
import { EventCategoryEntity } from '../events/domain/entities/event-category.entity';
import { PointOfInterestEntity } from '../events/domain/entities/point-of-interest.entity';
import { AnalyticsController } from './presentation/controllers/analytics.controller';
import { AnalyticsService } from './application/services/analytics.service';
import { AnalyticsRepository } from './domain/repositories/analytics.repository';
import { TypeormAnalyticsRepository } from './infrastructure/persistence/typeorm/typeorm-analytics.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      EventEntity,
      EventCategoryEntity,
      PointOfInterestEntity,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [
    AnalyticsService,
    { provide: AnalyticsRepository, useClass: TypeormAnalyticsRepository },
  ],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
