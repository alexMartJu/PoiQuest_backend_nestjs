import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsController } from './presentation/controllers/events.controller';
import { EventCategoriesController } from './presentation/controllers/event-categories.controller';
import { PointsOfInterestController } from './presentation/controllers/points-of-interest.controller';
import { EventsService } from './application/services/events.service';
import { EventCategoriesService } from './application/services/event-categories.service';
import { PointsOfInterestService } from './application/services/points-of-interest.service';
import { EventEntity } from './domain/entities/event.entity';
import { EventCategoryEntity } from './domain/entities/event-category.entity';
import { PointOfInterestEntity } from './domain/entities/point-of-interest.entity';
import { EventsRepository } from './domain/repositories/events.repository';
import { EventCategoriesRepository } from './domain/repositories/event-categories.repository';
import { PointsOfInterestRepository } from './domain/repositories/points-of-interest.repository';
import { TypeormEventsRepository } from './infrastructure/persistence/typeorm/typeorm-events.repository';
import { TypeormEventCategoriesRepository } from './infrastructure/persistence/typeorm/typeorm-event-categories.repository';
import { TypeormPointsOfInterestRepository } from './infrastructure/persistence/typeorm/typeorm-points-of-interest.repository';
import { MediaModule } from '../media/media.module';
import { MinioClientModule } from '../minio-client/minio-client.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EventEntity, EventCategoryEntity, PointOfInterestEntity]),
    MediaModule,
    MinioClientModule,
  ],
  controllers: [EventsController, EventCategoriesController, PointsOfInterestController],
  providers: [
    EventsService,
    EventCategoriesService,
    PointsOfInterestService,
    { provide: EventsRepository, useClass: TypeormEventsRepository },
    { provide: EventCategoriesRepository, useClass: TypeormEventCategoriesRepository },
    { provide: PointsOfInterestRepository, useClass: TypeormPointsOfInterestRepository },
  ],
  exports: [
    EventsService, 
    EventCategoriesService, 
    PointsOfInterestService,
    EventsRepository, 
    EventCategoriesRepository,
    PointsOfInterestRepository,
  ],
})
export class EventsModule {}
