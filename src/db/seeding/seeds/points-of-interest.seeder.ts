import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { PointOfInterestEntity } from '../../../events/domain/entities/point-of-interest.entity';
import { EventEntity } from '../../../events/domain/entities/event.entity';
import { ImageEntity } from '../../../media/domain/entities/image.entity';
import { ImageableType } from '../../../media/domain/enums/imageable-type.enum';
import poisData from '../../../data/points-of-interest';
import * as fs from 'fs';
import * as path from 'path';
import * as Minio from 'minio';

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

        // Crear imágenes si existen (subir locales a MinIO y guardar metadata)
        if (poiData.imageFiles && poiData.imageFiles.length > 0) {
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
          for (let i = 0; i < poiData.imageFiles.length; i++) {
            const fileName = poiData.imageFiles[i];
            const localPath = path.join(assetsDir, fileName);
            if (!fs.existsSync(localPath)) {
              console.warn(`Local asset not found: ${localPath} — skipping`);
              continue;
            }

            const objectName = `pois/${savedPoi.id}/${Date.now()}_${fileName}`;

            try {
              await new Promise<void>((res, rej) =>
                (minioClient as any).fPutObject(bucket, objectName, localPath, {}, (err: Error | null) => (err ? rej(err) : res())),
              );
            } catch (err) {
              console.error(`Error uploading ${localPath} to MinIO:`, err);
              continue;
            }

            const img = imageRepo.create({
              fileName: objectName,
              bucket,
              imageableType: ImageableType.POI,
              imageableId: savedPoi.id,
              sortOrder: i + 1,
              isPrimary: i === 0,
            } as unknown as ImageEntity);

            imagesToSave.push(img);
          }

          if (imagesToSave.length > 0) {
            await imageRepo.save(imagesToSave);
          }
        }
      }
    });

    console.log('Points of Interest seeded successfully');
  }
}
