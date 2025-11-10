import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { PointOfInterestEntity } from '../../../events/domain/entities/point-of-interest.entity';
import { EventEntity } from '../../../events/domain/entities/event.entity';
import poisData from '../../../data/points-of-interest';

export class PointOfInterestSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const poiRepo = dataSource.getRepository(PointOfInterestEntity);
    const eventRepo = dataSource.getRepository(EventEntity);

    // Obtener todos los eventos para mapear por nombre
    const events = await eventRepo.find();
    const eventMap = new Map(events.map(event => [event.name.toLowerCase(), event.id]));

    // Crear POIs con sus eventos correspondientes
    const pois = poisData.map((poiData) => {
      const eventId = eventMap.get(poiData.eventName.toLowerCase());
      if (!eventId) {
        throw new Error(`Event not found: ${poiData.eventName}`);
      }
      
      return poiRepo.create({
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
    });
    
    await poiRepo.save(pois);

    console.log('Points of Interest seeded successfully');
  }
}
