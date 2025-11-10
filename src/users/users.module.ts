import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './domain/entities/user.entity';
import { RoleEntity } from './domain/entities/role.entity';
import { ProfileEntity } from '../profile/domain/entities/profile.entity';
import { UsersController } from './presentation/controllers/users.controller';
import { UsersService } from './application/services/users.service';
import { UsersRepository } from './domain/repositories/users.repository';
import { TypeormUsersRepository } from './infrastructure/persistence/typeorm/typeorm-users.repository';
import { ProfileModule } from '../profile/profile.module';

@Module({
  imports: [
  TypeOrmModule.forFeature([UserEntity, RoleEntity, ProfileEntity]),
  ProfileModule,
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    { provide: UsersRepository, useClass: TypeormUsersRepository },
  ],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
