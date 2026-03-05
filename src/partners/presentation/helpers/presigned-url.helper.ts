import { ImageEntity } from '../../../media/domain/entities/image.entity';
import { FilesService } from '../../../media/application/services/files.service';

/**
 * Helper para generar URLs presigned para imágenes (módulo partners)
 * Reutiliza la misma lógica que en el módulo events
 */
export class PresignedUrlHelper {
  static async generatePresignedUrls(
    images: ImageEntity[],
    filesService: FilesService,
    expirySeconds: number = 86400,
  ): Promise<Map<number, string>> {
    const urlMap = new Map<number, string>();
    for (const image of images) {
      try {
        const result = await filesService.generatePresignedGetUrl(image.bucket, image.fileName, expirySeconds);
        urlMap.set(image.id, result.url);
      } catch (error) {
        console.error(`Error al generar URL presigned para imagen ${image.id}:`, error);
      }
    }
    return urlMap;
  }

  static async generatePresignedUrlsForMap(
    imagesMap: Map<number, ImageEntity[]>,
    filesService: FilesService,
    expirySeconds: number = 86400,
  ): Promise<Map<number, string>> {
    const allImages: ImageEntity[] = [];
    for (const images of imagesMap.values()) {
      allImages.push(...images);
    }
    return await this.generatePresignedUrls(allImages, filesService, expirySeconds);
  }
}
