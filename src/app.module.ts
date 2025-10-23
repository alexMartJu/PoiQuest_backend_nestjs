import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';

//Entities
import { UserEntity } from './entities/user.entity';
import { ProfileEntity } from './entities/profile.entity';
import { RoleEntity } from './entities/role.entity';
import { PermissionEntity } from './entities/permission.entity';
import { BlacklistTokenEntity } from './entities/blacklist-token.entity';
import { EventEntity } from './entities/event.entity';
import { PointOfInterestEntity } from './entities/point-of-interest.entity';
import { TimeSlotEntity } from './entities/time-slot.entity';
import { TicketEntity } from './entities/ticket.entity';
import { PaymentEntity } from './entities/payment.entity';
import { ScanEntity } from './entities/scan.entity';
import { AchievementEntity } from './entities/achievement.entity';
import { UserAchievementEntity } from './entities/user-achievement.entity';
import { RouteEntity } from './entities/route.entity';
import { ImageEntity } from './entities/image.entity';
import { NotificationEntity } from './entities/notification.entity';
import { IncidentEntity } from './entities/incident.entity';

//Modules
import { UsersModule } from './users/users.module';

@Module({
  imports: [
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
          PermissionEntity,
          BlacklistTokenEntity,
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
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
