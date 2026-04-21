import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { TicketEntity } from './domain/entities/ticket.entity';
import { PaymentEntity } from './domain/entities/payment.entity';
import { PaymentsController } from './presentation/controllers/payments.controller';
import { PaymentsService } from './application/services/payments.service';
import { PaymentsSchedulerService } from './application/services/payments-scheduler.service';
import { PaymentsRepository } from './domain/repositories/payments.repository';
import { TypeormPaymentsRepository } from './infrastructure/persistence/typeorm/typeorm-payments.repository';
import { EventsModule } from '../events/events.module';
import { ProfileModule } from '../profile/profile.module';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TicketEntity, PaymentEntity]),
    ScheduleModule.forRoot(),
    EventsModule,
    ProfileModule,
    GamificationModule,
  ],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    PaymentsSchedulerService,
    { provide: PaymentsRepository, useClass: TypeormPaymentsRepository },
  ],
  exports: [PaymentsService, PaymentsRepository],
})
export class PaymentsModule {}
