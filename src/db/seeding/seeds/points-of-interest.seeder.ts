import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { PointOfInterestEntity } from '../../../events/domain/entities/point-of-interest.entity';
import { EventEntity } from '../../../events/domain/entities/event.entity';
import { ImageEntity } from '../../../media/domain/entities/image.entity';
import { ImageableType } from '../../../media/domain/enums/imageable-type.enum';
import poisData from '../../../data/points-of-interest';

export class PointOfInterestSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const poiRepo = dataSource.getRepository(PointOfInterestEntity);
    const eventRepo = dataSource.getRepository(EventEntity);
    const imageRepo = dataSource.getRepository(ImageEntity);

    // Obtener todos los eventos para mapear por nombre
    const events = await eventRepo.find();
    const eventMap = new Map(events.map(event => [event.name.toLowerCase(), event.id]));

    // Crear POIs con sus eventos correspondientes e imágenes dentro de una transacción
    await dataSource.transaction(async (manager) => {
      for (const poiData of poisData) {
        const eventId = eventMap.get(poiData.eventName.toLowerCase());
        if (!eventId) {
          throw new Error(`Event not found: ${poiData.eventName}`);
        }
        
        // Crear el POI
        const poi = poiRepo.create({
          eventId: eventId,
          title: poiData.title,
          author: poiData.author,
          description: poiData.description,
          multimedia: poiData.multimedia,
          qrCode: poiData.qrCode,
          nfcTag: poiData.nfcTag,
          coordX: poiData.coordX,
          coordY: poiData.coordY,
        });
        
        const savedPoi = await manager.save(PointOfInterestEntity, poi);

        // Crear imágenes si existen
        if (poiData.imageUrls && poiData.imageUrls.length > 0) {
          const images = poiData.imageUrls.map((url, imageIdx) => 
            imageRepo.create({
              imageUrl: url,
              imageableType: ImageableType.POI,
              imageableId: savedPoi.id,
              sortOrder: imageIdx + 1,
              isPrimary: imageIdx === 0,
            })
          );
          await manager.save(ImageEntity, images);
        }
      }
    });

    console.log('Points of Interest seeded successfully');
  }
}
