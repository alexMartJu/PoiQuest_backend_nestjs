import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScanEntity } from './domain/entities/scan.entity';
import { ExploreController } from './presentation/controllers/explore.controller';
import { ExploreService } from './application/services/explore.service';
import { ExploreRepository } from './domain/repositories/explore.repository';
import { TypeormExploreRepository } from './infrastructure/persistence/typeorm/typeorm-explore.repository';
import { TicketEntity } from '../payments/domain/entities/ticket.entity';
import { PointOfInterestEntity } from '../events/domain/entities/point-of-interest.entity';
import { RouteEntity } from '../events/domain/entities/route.entity';
import { ImageEntity } from '../media/domain/entities/image.entity';
import { MediaModule } from '../media/media.module';
import { ProfileModule } from '../profile/profile.module';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ScanEntity,
      TicketEntity,
      PointOfInterestEntity,
      RouteEntity,
      ImageEntity,
    ]),
    MediaModule,
    ProfileModule,
    GamificationModule,
  ],
  controllers: [ExploreController],
  providers: [
    ExploreService,
    { provide: ExploreRepository, useClass: TypeormExploreRepository },
  ],
  exports: [ExploreService],
})
export class ExploreModule {}
