import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { EventEntity } from '../../../events/domain/entities/event.entity';
import eventsData from '../../../data/events';

export class EventSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(EventEntity);

    const events = eventsData.map((eventData) => repo.create(eventData));
    await repo.save(events);

    console.log('Events seeded successfully');
  }
}
