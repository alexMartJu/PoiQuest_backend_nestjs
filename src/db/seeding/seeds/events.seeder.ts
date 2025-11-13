import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { EventEntity } from '../../../events/domain/entities/event.entity';
import { EventCategoryEntity } from '../../../events/domain/entities/event-category.entity';
import { ImageEntity } from '../../../media/domain/entities/image.entity';
import { ImageableType } from '../../../media/domain/enums/imageable-type.enum';
import eventsData from '../../../data/events';

export class EventSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const eventRepo = dataSource.getRepository(EventEntity);
    const categoryRepo = dataSource.getRepository(EventCategoryEntity);
    const imageRepo = dataSource.getRepository(ImageEntity);

    // Primero, obtener todas las categorías para mapear por nombre
    const categories = await categoryRepo.find();
    const categoryMap = new Map(categories.map(cat => [cat.name.toLowerCase(), cat.id]));

    // Crear eventos con las categorías correspondientes dentro de una transacción
    await dataSource.transaction(async (manager) => {
      // Restar 1 hora (3600000 ms) al tiempo base para que los seeds queden
      // una hora atrás respecto a la hora actual (esto hace que coincidan
      // con los eventos creados por la API que viste con -1h).
      const baseTime = Date.now() - 3600000;

      for (let idx = 0; idx < eventsData.length; idx++) {
        const eventData = eventsData[idx];
        const categoryId = categoryMap.get(eventData.categoryName.toLowerCase());
        if (!categoryId) {
          throw new Error(`Category not found: ${eventData.categoryName}`);
        }

        const ts = new Date(baseTime + idx * 1);

        // Crear el evento
        const event = eventRepo.create({
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
        
        const savedEvent = await manager.save(EventEntity, event);

        // Crear imágenes si existen
        if (eventData.imageUrls && eventData.imageUrls.length > 0) {
          const images = eventData.imageUrls.map((url, imageIdx) => 
            imageRepo.create({
              imageUrl: url,
              imageableType: ImageableType.EVENT,
              imageableId: savedEvent.id,
              sortOrder: imageIdx + 1,
              isPrimary: imageIdx === 0,
            })
          );
          await manager.save(ImageEntity, images);
        }
      }
    });

    console.log('Events seeded successfully');
  }
}
