import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './domain/entities/user.entity';
import { RoleEntity } from './domain/entities/role.entity';
import { ProfileEntity } from '../entities/profile.entity';
import { UsersService } from './application/services/users.service';
import { UsersRepository } from './domain/repositories/users.repository';
import { TypeormUsersRepository } from './infrastructure/persistence/typeorm/typeorm-users.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, RoleEntity, ProfileEntity]),
  ],
  providers: [
    UsersService,
    { provide: UsersRepository, useClass: TypeormUsersRepository },
  ],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
