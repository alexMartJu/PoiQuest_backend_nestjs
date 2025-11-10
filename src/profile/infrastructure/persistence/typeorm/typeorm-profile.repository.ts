import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { ProfileRepository } from '../../../domain/repositories/profile.repository';
import { ProfileEntity } from '../../../domain/entities/profile.entity';

@Injectable()
export class TypeormProfileRepository implements ProfileRepository {
  constructor(
    @InjectRepository(ProfileEntity)
    private readonly profileRepo: Repository<ProfileEntity>,
  ) {}

  async findOneByUserId(userId: number): Promise<ProfileEntity | null> {
    return await this.profileRepo.findOne({
      where: { userId },
      relations: ['user', 'user.roles'],
    });
  }

  async findOneByUuid(uuid: string): Promise<ProfileEntity | null> {
    return await this.profileRepo.findOne({
      where: { uuid },
      relations: ['user', 'user.roles'],
    });
  }

  async save(profile: ProfileEntity): Promise<ProfileEntity> {
    return await this.profileRepo.save(profile);
  }

  // Guarda usando el EntityManager proporcionado para participar en la transacción
  async saveWithManager(manager: EntityManager, profile: ProfileEntity): Promise<ProfileEntity> {
    return await manager.getRepository(ProfileEntity).save(profile);
  }
}
