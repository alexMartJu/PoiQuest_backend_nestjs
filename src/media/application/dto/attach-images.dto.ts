import { ImageableType } from '../../domain/enums/imageable-type.enum';

export interface AttachImageInfo {
  fileName: string;
  bucket: string;
}

export interface AttachImagesDto {
  imageableType: ImageableType;
  imageableId: number;
  images: AttachImageInfo[]; // Lista de archivos con fileName y bucket
}
