import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { RoleEntity } from '../../../users/domain/entities/role.entity';
import roleData from '../../../data/roles';

export class RoleSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(RoleEntity);

    const roles = roleData.map((r) => repo.create(r));
    await repo.save(roles);

    console.log('Roles seeded successfully');
  }
}
