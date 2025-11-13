import { ImageEntity } from '../../../media/domain/entities/image.entity';

/**
 * Helper para construir un mapa de imágenes agrupadas por imageableId
 * @param images Lista de imágenes
 * @returns Map<imageableId, ImageEntity[]>
 */
export function buildImagesMap(images: ImageEntity[]): Map<number, ImageEntity[]> {
  const imagesMap = new Map<number, ImageEntity[]>();
  for (const img of images) {
    const arr = imagesMap.get(img.imageableId) ?? [];
    arr.push(img);
    imagesMap.set(img.imageableId, arr);
  }
  return imagesMap;
}
