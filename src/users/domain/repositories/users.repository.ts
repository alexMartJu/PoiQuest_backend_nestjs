import { UserEntity } from '../entities/user.entity';
import { RoleEntity } from '../entities/role.entity';

export abstract class UsersRepository {
  abstract findAll(): Promise<UserEntity[]>;
  abstract findOneById(userId: number): Promise<UserEntity | null>;
  abstract findOneByEmail(email: string): Promise<UserEntity | null>;
  abstract create(data: Partial<UserEntity>): UserEntity;
  abstract save(user: UserEntity): Promise<UserEntity>;
  abstract deleteById(userId: number): Promise<void>;
  abstract existsById(userId: number): Promise<boolean>;
  abstract findRoleByName(name: string): Promise<RoleEntity | null>;
}
