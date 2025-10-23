import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../entities/user.entity';
import { ProfileEntity } from '../entities/profile.entity';
import { RoleEntity } from '../entities/role.entity';


@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, ProfileEntity, RoleEntity])],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService], // Exporta el servicio para usarlo en otros módulos
})
export class UsersModule {}
