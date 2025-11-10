import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileEntity } from './domain/entities/profile.entity';
import { ProfileController } from './presentation/controllers/profile.controller';
import { ProfileService } from './application/services/profile.service';
import { ProfileRepository } from './domain/repositories/profile.repository';
import { TypeormProfileRepository } from './infrastructure/persistence/typeorm/typeorm-profile.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ProfileEntity])],
  controllers: [ProfileController],
  providers: [
    ProfileService,
    { provide: ProfileRepository, useClass: TypeormProfileRepository },
  ],
  exports: [ProfileService, ProfileRepository],
})
export class ProfileModule {}
