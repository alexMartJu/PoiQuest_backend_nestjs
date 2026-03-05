import { ImageEntity } from '../../../media/domain/entities/image.entity';

/**
 * Helper compartido para construir un mapa de imágenes agrupadas por imageableId
 * @param images Lista de imágenes
 * @returns Map<imageableId, ImageEntity[]>
 */
export function buildImagesMap(images: ImageEntity[]): Map<number, ImageEntity[]> {
  const imagesMap = new Map<number, ImageEntity[]>();
  for (const img of images) {
    const existing = imagesMap.get(img.imageableId) ?? [];
    existing.push(img);
    imagesMap.set(img.imageableId, existing);
  }
  return imagesMap;
}
