import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { EventCategoryEntity } from '../../../events/domain/entities/event-category.entity';
import eventCategoriesData from '../../../data/event-categories';

export class EventCategorySeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(EventCategoryEntity);

    const categories = eventCategoriesData.map((catData) => repo.create(catData));
    await repo.save(categories);

    console.log('Event categories seeded successfully');
  }
}
