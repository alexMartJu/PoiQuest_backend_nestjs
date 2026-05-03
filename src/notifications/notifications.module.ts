import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity } from './domain/entities/notification.entity';
import { NotificationsRepository } from './domain/repositories/notifications.repository';
import { TypeormNotificationsRepository } from './infrastructure/persistence/typeorm/typeorm-notifications.repository';
import { NotificationsService } from './application/services/notifications.service';
import { NotificationsSchedulerService } from './application/services/notifications-scheduler.service';
import { NotificationsController } from './presentation/controllers/notifications.controller';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationEntity]),
    PaymentsModule,
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsSchedulerService,
    {
      provide: NotificationsRepository,
      useClass: TypeormNotificationsRepository,
    },
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
