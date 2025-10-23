import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions, runSeeders } from 'typeorm-extension';
import { config } from 'dotenv';

// Entities
import { UserEntity } from './entities/user.entity';
import { RoleEntity } from './entities/role.entity';
import { PermissionEntity } from './entities/permission.entity';
import { ProfileEntity } from './entities/profile.entity';
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

// Seeders
import { RoleSeeder } from './db/seeding/seeds/roles.seeder';
import { UserSeeder } from './db/seeding/seeds/users.seeder';

config();

const options: DataSourceOptions & SeederOptions = {
  type: 'mariadb',
  host: process.env.DB_HOST || 'database',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'poiquest',
  entities: [
    UserEntity,
    RoleEntity,
    ProfileEntity,
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
  seeds: [RoleSeeder, UserSeeder],
};

const dataSource = new DataSource(options);

dataSource
  .initialize()
  .then(async () => {
    console.log('Starting database seeding...');
    await dataSource.synchronize(true);
    await runSeeders(dataSource);
    console.log('Seeding completed!');
    process.exit();
  })
  .catch((err) => {
    console.error('Error initializing datasource:', err);
    process.exit(1);
  });
