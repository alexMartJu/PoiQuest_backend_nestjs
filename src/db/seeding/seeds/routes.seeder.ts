import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { RouteEntity } from '../../../events/domain/entities/route.entity';
import { RoutePoiEntity } from '../../../events/domain/entities/route-poi.entity';
import { EventEntity } from '../../../events/domain/entities/event.entity';
import { PointOfInterestEntity } from '../../../events/domain/entities/point-of-interest.entity';
import routesData from '../../../data/routes';

export class RouteSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const routeRepo = dataSource.getRepository(RouteEntity);
    const routePoiRepo = dataSource.getRepository(RoutePoiEntity);
    const eventRepo = dataSource.getRepository(EventEntity);
    const poiRepo = dataSource.getRepository(PointOfInterestEntity);

    // Mapas de nombre de evento → id y qrCode de poi → id
    const events = await eventRepo.find();
    const eventMap = new Map(events.map(e => [e.name.toLowerCase(), e.id]));

    const pois = await poiRepo.find();
    const poiMap = new Map(pois.map(p => [p.qrCode, p.id]));

    await dataSource.transaction(async (manager) => {
      for (const routeData of routesData) {
        const eventId = eventMap.get(routeData.eventName.toLowerCase());
        if (!eventId) {
          throw new Error(`Event not found for route seeder: ${routeData.eventName}`);
        }

        // Verificar que todos los POIs existen
        for (const qrCode of routeData.poiQrCodes) {
          if (!poiMap.has(qrCode)) {
            throw new Error(`POI with QR code not found for route seeder: ${qrCode}`);
          }
        }

        const route = routeRepo.create({
          eventId,
          name: routeData.name,
          description: routeData.description ?? null,
        });
        const saved = await manager.save(RouteEntity, route);

        for (let i = 0; i < routeData.poiQrCodes.length; i++) {
          const poiId = poiMap.get(routeData.poiQrCodes[i])!;
          const rp = routePoiRepo.create({
            routeId: saved.id,
            poiId,
            sortOrder: i + 1,
          });
          await manager.save(RoutePoiEntity, rp);
        }
      }
    });

    console.log('Routes seeded successfully');
  }
}
