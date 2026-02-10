import { ImageEntity } from '../../../media/domain/entities/image.entity';
import { FilesService } from '../../../media/application/services/files.service';

/**
 * Helper para generar URLs presigned para imágenes
 * Utilízalo en los controladores para generar URLs antes de mapear a responses
 */
export class PresignedUrlHelper {
  /**
   * Genera URLs presigned para un array de imágenes
   * @param images - Array de ImageEntity
   * @param filesService - Servicio de archivos para generar URLs presigned
   * @param expirySeconds - Tiempo de expiración en segundos (por defecto 86400 = 24 horas)
   * @returns Map de imageId a URL presigned
   */
  static async generatePresignedUrls(
    images: ImageEntity[],
    filesService: FilesService,
    expirySeconds: number = 86400,
  ): Promise<Map<number, string>> {
    const urlMap = new Map<number, string>();

    for (const image of images) {
      try {
        const result = await filesService.generatePresignedGetUrl(
          image.bucket,
          image.fileName,
          expirySeconds,
        );
        urlMap.set(image.id, result.url);
      } catch (error) {
        console.error(`Error al generar URL presigned para imagen ${image.id}:`, error);
        // Si falla, simplemente no añadimos la URL al map
      }
    }

    return urlMap;
  }

  /**
   * Genera URLs presigned para imágenes agrupadas por imageableId
   * @param imagesMap - Map de imageableId a array de ImageEntity
   * @param filesService - Servicio de archivos para generar URLs presigned
   * @param expirySeconds - Tiempo de expiración en segundos
   * @returns Map de imageId a URL presigned
   */
  static async generatePresignedUrlsForMap(
    imagesMap: Map<number, ImageEntity[]>,
    filesService: FilesService,
    expirySeconds: number = 86400,
  ): Promise<Map<number, string>> {
    const allImages: ImageEntity[] = [];
    
    // Aplanar todas las imágenes del map
    for (const images of imagesMap.values()) {
      allImages.push(...images);
    }

    return await this.generatePresignedUrls(allImages, filesService, expirySeconds);
  }
}
