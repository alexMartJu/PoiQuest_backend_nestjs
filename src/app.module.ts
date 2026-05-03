import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

//Entities
import { UserEntity } from './users/domain/entities/user.entity';
import { ProfileEntity } from './profile/domain/entities/profile.entity';
import { RoleEntity } from './users/domain/entities/role.entity';
import { BlacklistTokenEntity } from './auth/domain/entities/blacklist-token.entity';
import { EventCategoryEntity } from './events/domain/entities/event-category.entity';
import { EventEntity } from './events/domain/entities/event.entity';
import { PointOfInterestEntity } from './events/domain/entities/point-of-interest.entity';
import { TicketEntity } from './payments/domain/entities/ticket.entity';
import { CityEntity } from './partners/domain/entities/city.entity';
import { OrganizerEntity } from './partners/domain/entities/organizer.entity';
import { SponsorEntity } from './partners/domain/entities/sponsor.entity';
import { PaymentEntity } from './payments/domain/entities/payment.entity';
import { ScanEntity } from './explore/domain/entities/scan.entity';
import { AchievementEntity } from './gamification/domain/entities/achievement.entity';
import { UserAchievementEntity } from './gamification/domain/entities/user-achievement.entity';
import { LevelEntity } from './gamification/domain/entities/level.entity';
import { RouteEntity } from './events/domain/entities/route.entity';
import { RoutePoiEntity } from './events/domain/entities/route-poi.entity';
import { ImageEntity } from './media/domain/entities/image.entity';
import { NotificationEntity } from './notifications/domain/entities/notification.entity';
import { TicketValidationEntity } from './ticket-validation/domain/entities/ticket-validation.entity';

//Modules
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { PartnersModule } from './partners/partners.module';
import { PaymentsModule } from './payments/payments.module';
import { TicketValidationModule } from './ticket-validation/ticket-validation.module';
import { ExploreModule } from './explore/explore.module';
import { GamificationModule } from './gamification/gamification.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_DATABASE || 'poiquest',
        entities: [
          UserEntity,
          ProfileEntity,
          RoleEntity,
          BlacklistTokenEntity,
          EventCategoryEntity,
          CityEntity,
          OrganizerEntity,
          SponsorEntity,
          EventEntity,
          PointOfInterestEntity,
          TicketEntity,
          PaymentEntity,
          ScanEntity,
          AchievementEntity,
          UserAchievementEntity,
          LevelEntity,
          RouteEntity,
          RoutePoiEntity,
          ImageEntity,
          NotificationEntity,
          TicketValidationEntity,
        ],
        synchronize: true, // ⚠️ Solo para desarrollo (NO en producción)
        autoLoadEntities: true, // Permite cargar automáticamente las entidades
      }),
    }),
    AuthModule,
    UsersModule,
    EventsModule,
    ProfileModule,
    AnalyticsModule,
    PartnersModule,
    PaymentsModule,
    TicketValidationModule,
    ExploreModule,
    GamificationModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
