import { ProfileEntity } from '../entities/profile.entity';
import { EntityManager } from 'typeorm';

export abstract class ProfileRepository {
  abstract findOneByUserId(userId: number): Promise<ProfileEntity | null>;
  abstract findOneByUuid(uuid: string): Promise<ProfileEntity | null>;
  abstract save(profile: ProfileEntity): Promise<ProfileEntity>;

  // Permite guardar usando un EntityManager (para participar en transacciones externas)
  abstract saveWithManager(manager: EntityManager, profile: ProfileEntity): Promise<ProfileEntity>;
}
