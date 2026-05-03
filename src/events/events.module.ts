import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsController } from './presentation/controllers/events.controller';
import { EventCategoriesController } from './presentation/controllers/event-categories.controller';
import { PointsOfInterestController } from './presentation/controllers/points-of-interest.controller';
import { RoutesController } from './presentation/controllers/routes.controller';
import { EventsService } from './application/services/events.service';
import { EventCategoriesService } from './application/services/event-categories.service';
import { PointsOfInterestService } from './application/services/points-of-interest.service';
import { RoutesService } from './application/services/routes.service';
import { EventsSchedulerService } from './application/services/events-scheduler.service';
import { EventEntity } from './domain/entities/event.entity';
import { EventCategoryEntity } from './domain/entities/event-category.entity';
import { PointOfInterestEntity } from './domain/entities/point-of-interest.entity';
import { RouteEntity } from './domain/entities/route.entity';
import { RoutePoiEntity } from './domain/entities/route-poi.entity';
import { EventsRepository } from './domain/repositories/events.repository';
import { EventCategoriesRepository } from './domain/repositories/event-categories.repository';
import { PointsOfInterestRepository } from './domain/repositories/points-of-interest.repository';
import { RoutesRepository } from './domain/repositories/routes.repository';
import { TypeormEventsRepository } from './infrastructure/persistence/typeorm/typeorm-events.repository';
import { TypeormEventCategoriesRepository } from './infrastructure/persistence/typeorm/typeorm-event-categories.repository';
import { TypeormPointsOfInterestRepository } from './infrastructure/persistence/typeorm/typeorm-points-of-interest.repository';
import { TypeormRoutesRepository } from './infrastructure/persistence/typeorm/typeorm-routes.repository';
import { MediaModule } from '../media/media.module';
import { MinioClientModule } from '../minio-client/minio-client.module';
import { PartnersModule } from '../partners/partners.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EventEntity, EventCategoryEntity, PointOfInterestEntity, RouteEntity, RoutePoiEntity]),
    MediaModule,
    MinioClientModule,
    PartnersModule,
  ],
  controllers: [EventsController, EventCategoriesController, PointsOfInterestController, RoutesController],
  providers: [
    EventsService,
    EventCategoriesService,
    PointsOfInterestService,
    RoutesService,
    EventsSchedulerService,
    { provide: EventsRepository, useClass: TypeormEventsRepository },
    { provide: EventCategoriesRepository, useClass: TypeormEventCategoriesRepository },
    { provide: PointsOfInterestRepository, useClass: TypeormPointsOfInterestRepository },
    { provide: RoutesRepository, useClass: TypeormRoutesRepository },
  ],
  exports: [
    EventsService,
    EventCategoriesService,
    PointsOfInterestService,
    RoutesService,
    EventsRepository,
    EventCategoriesRepository,
    PointsOfInterestRepository,
    RoutesRepository,
  ],
})
export class EventsModule {}
