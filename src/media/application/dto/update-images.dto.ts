import { ImageableType } from '../../domain/enums/imageable-type.enum';

export interface UpdateImagesDto {
  imageableType: ImageableType;
  imageableId: number;
  imageUrls: string[]; // Nueva lista de URLs (reconciliación)
}
