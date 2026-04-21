import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { AchievementEntity } from '../../../gamification/domain/entities/achievement.entity';
import { achievements } from '../../../data/achievements';

export class AchievementSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(AchievementEntity);

    for (const achievement of achievements) {
      const existing = await repo.findOne({ where: { key: achievement.key } });
      if (!existing) {
        await repo.save(repo.create(achievement));
      }
    }

    console.log('Achievements seeded');
  }
}
