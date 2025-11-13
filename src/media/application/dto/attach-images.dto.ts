import { ImageableType } from '../../domain/enums/imageable-type.enum';

export interface AttachImagesDto {
  imageableType: ImageableType;
  imageableId: number;
  imageUrls: string[]; // URLs ordenadas, la primera es primaria
}
