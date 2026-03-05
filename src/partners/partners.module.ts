import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CityEntity } from './domain/entities/city.entity';
import { OrganizerEntity } from './domain/entities/organizer.entity';
import { SponsorEntity } from './domain/entities/sponsor.entity';
import { CitiesRepository } from './domain/repositories/cities.repository';
import { OrganizersRepository } from './domain/repositories/organizers.repository';
import { SponsorsRepository } from './domain/repositories/sponsors.repository';
import { TypeormCitiesRepository } from './infrastructure/persistence/typeorm/typeorm-cities.repository';
import { TypeormOrganizersRepository } from './infrastructure/persistence/typeorm/typeorm-organizers.repository';
import { TypeormSponsorsRepository } from './infrastructure/persistence/typeorm/typeorm-sponsors.repository';
import { CitiesService } from './application/services/cities.service';
import { OrganizersService } from './application/services/organizers.service';
import { SponsorsService } from './application/services/sponsors.service';
import { CitiesController } from './presentation/controllers/cities.controller';
import { OrganizersController } from './presentation/controllers/organizers.controller';
import { SponsorsController } from './presentation/controllers/sponsors.controller';
import { MediaModule } from '../media/media.module';
import { MinioClientModule } from '../minio-client/minio-client.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CityEntity, OrganizerEntity, SponsorEntity]),
    MediaModule,
    MinioClientModule,
  ],
  controllers: [CitiesController, OrganizersController, SponsorsController],
  providers: [
    CitiesService,
    OrganizersService,
    SponsorsService,
    { provide: CitiesRepository, useClass: TypeormCitiesRepository },
    { provide: OrganizersRepository, useClass: TypeormOrganizersRepository },
    { provide: SponsorsRepository, useClass: TypeormSponsorsRepository },
  ],
  exports: [
    CitiesService,
    OrganizersService,
    SponsorsService,
    CitiesRepository,
    OrganizersRepository,
    SponsorsRepository,
  ],
})
export class PartnersModule {}
