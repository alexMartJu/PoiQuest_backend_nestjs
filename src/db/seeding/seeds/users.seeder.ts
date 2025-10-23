import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import * as bcrypt from 'bcryptjs';
import userData from '../../../data/users';
import { UserEntity, UserStatus } from '../../../entities/user.entity';
import { RoleEntity } from '../../../entities/role.entity';
import { ProfileEntity } from '../../../entities/profile.entity';

export class UserSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const userRepo = dataSource.getRepository(UserEntity);
    const roleRepo = dataSource.getRepository(RoleEntity);
    const profileRepo = dataSource.getRepository(ProfileEntity);

    for (const user of userData) {
      const role = await roleRepo.findOne({ where: { name: user.role } });
      if (!role) {
        console.warn(`Role not found for user ${user.email}`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(user.password, 10);

      const userEntity = userRepo.create({
        email: user.email,
        password: hashedPassword,
        status: UserStatus.ACTIVE,
        roles: [role],
      });

      const savedUser = await userRepo.save(userEntity);

      const profileEntity = profileRepo.create({
        ...user.profile,
        user: savedUser,
        userId: savedUser.id,
      });

      await profileRepo.save(profileEntity);
    }

    console.log('Users seeded successfully');
  }
}
