import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsController } from './presentation/controllers/events.controller';
import { EventsService } from './application/services/events.service';
import { EventEntity } from './domain/entities/event.entity';
import { EventsRepository } from './domain/repositories/events.repository';
import { TypeormEventsRepository } from './infrastructure/persistence/typeorm/typeorm-events.repository';

@Module({
  imports: [TypeOrmModule.forFeature([EventEntity])],
  controllers: [EventsController],
  providers: [
    EventsService,
    { provide: EventsRepository, useClass: TypeormEventsRepository },
  ],
  exports: [EventsService, EventsRepository],
})
export class EventsModule {}
