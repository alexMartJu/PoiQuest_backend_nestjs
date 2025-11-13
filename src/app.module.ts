import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

//Entities
import { UserEntity } from './users/domain/entities/user.entity';
import { ProfileEntity } from './profile/domain/entities/profile.entity';
import { RoleEntity } from './users/domain/entities/role.entity';
import { BlacklistTokenEntity } from './auth/domain/entities/blacklist-token.entity';
import { EventCategoryEntity } from './events/domain/entities/event-category.entity';
import { EventEntity } from './events/domain/entities/event.entity';
import { PointOfInterestEntity } from './events/domain/entities/point-of-interest.entity';
import { TimeSlotEntity } from './entities/time-slot.entity';
import { TicketEntity } from './entities/ticket.entity';
import { PaymentEntity } from './entities/payment.entity';
import { ScanEntity } from './entities/scan.entity';
import { AchievementEntity } from './entities/achievement.entity';
import { UserAchievementEntity } from './entities/user-achievement.entity';
import { RouteEntity } from './entities/route.entity';
import { ImageEntity } from './media/domain/entities/image.entity';
import { NotificationEntity } from './entities/notification.entity';
import { IncidentEntity } from './entities/incident.entity';

//Modules
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
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
          EventEntity,
          PointOfInterestEntity,
          TimeSlotEntity,
          TicketEntity,
          PaymentEntity,
          ScanEntity,
          AchievementEntity,
          UserAchievementEntity,
          RouteEntity,
          ImageEntity,
          NotificationEntity,
          IncidentEntity,
        ],
        synchronize: true, // ⚠️ Solo para desarrollo (NO en producción)
        autoLoadEntities: true, // Permite cargar automáticamente las entidades
      }),
    }),
    AuthModule,
    UsersModule,
    EventsModule,
    ProfileModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
