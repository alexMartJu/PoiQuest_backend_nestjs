import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { LevelEntity } from '../../../gamification/domain/entities/level.entity';
import { levels } from '../../../data/levels';

export class LevelSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(LevelEntity);

    for (const level of levels) {
      const existing = await repo.findOne({ where: { level: level.level } });
      if (!existing) {
        await repo.save(repo.create(level));
      }
    }

    console.log('Levels seeded');
  }
}
