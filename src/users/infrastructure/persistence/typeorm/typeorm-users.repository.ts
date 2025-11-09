import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersRepository } from '../../../domain/repositories/users.repository';
import { UserEntity } from '../../../domain/entities/user.entity';
import { RoleEntity } from '../../../domain/entities/role.entity';

@Injectable()
export class TypeormUsersRepository implements UsersRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,
  ) {}

  async findAll(): Promise<UserEntity[]> {
    return await this.userRepo.find({ 
      relations: ['roles', 'profile'],
      order: { createdAt: 'DESC' } 
    });
  }

  async findOneById(userId: number): Promise<UserEntity | null> {
    return await this.userRepo.findOne({ 
      where: { id: userId },
      relations: ['roles', 'profile'] 
    });
  }

  async findOneByEmail(email: string): Promise<UserEntity | null> {
    return await this.userRepo.findOne({ 
      where: { email },
      relations: ['roles', 'profile'] 
    });
  }

  create(data: Partial<UserEntity>): UserEntity {
    return this.userRepo.create(data);
  }

  async save(user: UserEntity): Promise<UserEntity> {
    return await this.userRepo.save(user);
  }

  async deleteById(userId: number): Promise<void> {
    await this.userRepo.delete(userId);
  }

  async existsById(userId: number): Promise<boolean> {
    const count = await this.userRepo.count({ where: { id: userId } });
    return count > 0;
  }

  async findRoleByName(name: string): Promise<RoleEntity | null> {
    return await this.roleRepo.findOne({ where: { name } });
  }
}
