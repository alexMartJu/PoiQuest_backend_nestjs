import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsController } from './presentation/controllers/events.controller';
import { EventCategoriesController } from './presentation/controllers/event-categories.controller';
import { EventsService } from './application/services/events.service';
import { EventCategoriesService } from './application/services/event-categories.service';
import { EventEntity } from './domain/entities/event.entity';
import { EventCategoryEntity } from './domain/entities/event-category.entity';
import { EventsRepository } from './domain/repositories/events.repository';
import { EventCategoriesRepository } from './domain/repositories/event-categories.repository';
import { TypeormEventsRepository } from './infrastructure/persistence/typeorm/typeorm-events.repository';
import { TypeormEventCategoriesRepository } from './infrastructure/persistence/typeorm/typeorm-event-categories.repository';

@Module({
  imports: [TypeOrmModule.forFeature([EventEntity, EventCategoryEntity])],
  controllers: [EventsController, EventCategoriesController],
  providers: [
    EventsService,
    EventCategoriesService,
    { provide: EventsRepository, useClass: TypeormEventsRepository },
    { provide: EventCategoriesRepository, useClass: TypeormEventCategoriesRepository },
  ],
  exports: [EventsService, EventCategoriesService, EventsRepository, EventCategoriesRepository],
})
export class EventsModule {}
