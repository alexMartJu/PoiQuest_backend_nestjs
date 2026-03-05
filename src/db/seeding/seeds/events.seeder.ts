import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { EventEntity } from '../../../events/domain/entities/event.entity';
import { EventCategoryEntity } from '../../../events/domain/entities/event-category.entity';
import { CityEntity } from '../../../partners/domain/entities/city.entity';
import { OrganizerEntity } from '../../../partners/domain/entities/organizer.entity';
import { SponsorEntity } from '../../../partners/domain/entities/sponsor.entity';
import { ImageEntity } from '../../../media/domain/entities/image.entity';
import { ImageableType } from '../../../media/domain/enums/imageable-type.enum';
import eventsData from '../../../data/events';
import * as fs from 'fs';
import * as path from 'path';
import * as Minio from 'minio';

export class EventSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const eventRepo = dataSource.getRepository(EventEntity);
    const categoryRepo = dataSource.getRepository(EventCategoryEntity);
    const cityRepo = dataSource.getRepository(CityEntity);
    const organizerRepo = dataSource.getRepository(OrganizerEntity);
    const sponsorRepo = dataSource.getRepository(SponsorEntity);
    const imageRepo = dataSource.getRepository(ImageEntity);

    // Mapas nombre → id para búsquedas rápidas
    const categories = await categoryRepo.find();
    const categoryMap = new Map(categories.map(cat => [cat.name.toLowerCase(), cat.id]));

    const cities = await cityRepo.find();
    const cityMap = new Map(cities.map(c => [c.name.toLowerCase(), c.id]));

    const organizers = await organizerRepo.find();
    const organizerMap = new Map(organizers.map(o => [o.name.toLowerCase(), o.id]));

    const sponsors = await sponsorRepo.find();
    const sponsorMap = new Map(sponsors.map(s => [s.name.toLowerCase(), s.id]));

    await dataSource.transaction(async (manager) => {
      const baseTime = Date.now() - 3600000;

      for (let idx = 0; idx < eventsData.length; idx++) {
        const eventData = eventsData[idx];

        const categoryId = categoryMap.get(eventData.categoryName.toLowerCase());
        if (!categoryId) {
          throw new Error(`Category not found: ${eventData.categoryName}`);
        }

        const cityId = cityMap.get(eventData.cityName.toLowerCase());
        if (!cityId) {
          throw new Error(`City not found: ${eventData.cityName}`);
        }

        const organizerId = organizerMap.get(eventData.organizerName.toLowerCase());
        if (!organizerId) {
          throw new Error(`Organizer not found: ${eventData.organizerName}`);
        }

        const sponsorId = eventData.sponsorName
          ? (sponsorMap.get(eventData.sponsorName.toLowerCase()) ?? null)
          : null;

        const ts = new Date(baseTime + idx * 1);

        const event = eventRepo.create({
          name: eventData.name,
          description: eventData.description,
          categoryId,
          cityId,
          organizerId,
          sponsorId,
          status: eventData.status,
          isPremium: eventData.isPremium,
          price: eventData.price ?? null,
          capacityPerDay: eventData.capacityPerDay ?? null,
          startDate: eventData.startDate,
          endDate: eventData.endDate,
          createdAt: ts,
          updatedAt: ts,
        });

        const savedEvent = await manager.save(EventEntity, event);

        // Subir imágenes a MinIO
        if (eventData.imageFiles && eventData.imageFiles.length > 0) {
          const assetsDir = path.resolve(__dirname, '../../assets/images');

          const minioClient = new Minio.Client({
            endPoint: process.env.MINIO_ENDPOINT || 'minio',
            port: parseInt(process.env.MINIO_PORT || '9000'),
            useSSL: process.env.MINIO_USE_SSL === 'true',
            accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
            secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
          });

          const bucket = process.env.MINIO_IMAGES_BUCKET || 'images';
          const imagesToSave: ImageEntity[] = [];

          for (let imageIdx = 0; imageIdx < eventData.imageFiles.length; imageIdx++) {
            const fileName = eventData.imageFiles[imageIdx];
            const localPath = path.join(assetsDir, fileName);
            if (!fs.existsSync(localPath)) {
              console.warn(`Local asset not found: ${localPath} — skipping`);
              continue;
            }

            const objectName = `events/${savedEvent.id}/${Date.now()}_${fileName}`;

            try {
              await new Promise<void>((res, rej) =>
                (minioClient as any).fPutObject(bucket, objectName, localPath, {}, (err: Error | null) =>
                  err ? rej(err) : res(),
                ),
              );
            } catch (err) {
              console.error(`Error uploading ${localPath} to MinIO:`, err);
              continue;
            }

            const img = imageRepo.create({
              fileName: objectName,
              bucket,
              imageableType: ImageableType.EVENT,
              imageableId: savedEvent.id,
              sortOrder: imageIdx + 1,
              isPrimary: imageIdx === 0,
            } as unknown as ImageEntity);

            imagesToSave.push(img);
          }

          if (imagesToSave.length > 0) {
            await imageRepo.save(imagesToSave);
          }
        }
      }
    });

    console.log('Events seeded successfully');
  }
}

