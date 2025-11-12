import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { EventEntity } from '../../../events/domain/entities/event.entity';
import { EventCategoryEntity } from '../../../events/domain/entities/event-category.entity';
import eventsData from '../../../data/events';

export class EventSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const eventRepo = dataSource.getRepository(EventEntity);
    const categoryRepo = dataSource.getRepository(EventCategoryEntity);

    // Primero, obtener todas las categorías para mapear por nombre
    const categories = await categoryRepo.find();
    const categoryMap = new Map(categories.map(cat => [cat.name.toLowerCase(), cat.id]));

    // Crear eventos con las categorías correspondientes
    // Añadimos un pequeño offset de 1 ms por índice para evitar timestamps idénticos
    const baseTime = Date.now();
    const events = eventsData.map((eventData, idx) => {
      const categoryId = categoryMap.get(eventData.categoryName.toLowerCase());
      if (!categoryId) {
        throw new Error(`Category not found: ${eventData.categoryName}`);
      }

      const ts = new Date(baseTime + idx * 1); // offset 1 ms por fila

      return eventRepo.create({
        name: eventData.name,
        description: eventData.description,
        categoryId: categoryId,
        status: eventData.status,
        location: eventData.location,
        startDate: eventData.startDate,
        endDate: eventData.endDate,
        createdAt: ts,
        updatedAt: ts,
      });
    });
    
    await eventRepo.save(events);

    console.log('Events seeded successfully');
  }
}
