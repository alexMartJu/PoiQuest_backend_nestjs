import { ImageableType } from '../../domain/enums/imageable-type.enum';

export interface UpdateImageInfo {
  fileName: string;
  bucket: string;
}

export interface UpdateImagesDto {
  imageableType: ImageableType;
  imageableId: number;
  images: UpdateImageInfo[]; // Nueva lista de archivos (reconciliación)
}
