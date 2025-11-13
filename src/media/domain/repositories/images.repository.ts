import { ImageEntity } from '../entities/image.entity';
import { ImageableType } from '../enums/imageable-type.enum';

export abstract class ImagesRepository {
  abstract findByImageable(imageableType: ImageableType, imageableId: number): Promise<ImageEntity[]>;
  abstract findByImageableIds(imageableType: ImageableType, imageableIds: number[]): Promise<ImageEntity[]>;
  abstract create(data: Partial<ImageEntity>): ImageEntity;
  abstract save(image: ImageEntity): Promise<ImageEntity>;
  abstract saveMany(images: ImageEntity[]): Promise<ImageEntity[]>;
  abstract deleteByImageable(imageableType: ImageableType, imageableId: number): Promise<void>;
  abstract deleteById(id: number): Promise<void>;
  abstract softDeleteByIds(ids: number[]): Promise<void>;
}
