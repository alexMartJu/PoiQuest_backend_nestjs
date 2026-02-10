import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { EventEntity } from '../../../events/domain/entities/event.entity';
import { EventCategoryEntity } from '../../../events/domain/entities/event-category.entity';
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

        // Crear imágenes si existen (subir archivos locales a MinIO y guardar metadata)
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

            // Subir a MinIO usando fPutObject
            try {
              await new Promise<void>((res, rej) =>
                // evitar error de firmas en las definiciones de Minio: castear a any
                (minioClient as any).fPutObject(bucket, objectName, localPath, {}, (err: Error | null) => (err ? rej(err) : res())),
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
