import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, In } from 'typeorm';
import { ImageEntity } from '../../../domain/entities/image.entity';
import { ImageableType } from '../../../domain/enums/imageable-type.enum';
import { ImagesRepository } from '../../../domain/repositories/images.repository';

@Injectable()
export class TypeormImagesRepository implements ImagesRepository {
  constructor(
    @InjectRepository(ImageEntity)
    private readonly imageRepo: Repository<ImageEntity>,
  ) {}

  async findByImageable(imageableType: ImageableType, imageableId: number): Promise<ImageEntity[]> {
    return await this.imageRepo.find({
      where: { 
        imageableType, 
        imageableId,
        deletedAt: IsNull() 
      },
      order: { sortOrder: 'ASC' },
    });
  }

  async findByImageableIds(imageableType: ImageableType, imageableIds: number[]): Promise<ImageEntity[]> {
    if (!imageableIds || imageableIds.length === 0) {
      return [];
    }
    return await this.imageRepo.find({
      where: {
        imageableType,
        imageableId: In(imageableIds),
        deletedAt: IsNull(),
      },
      order: { sortOrder: 'ASC' },
    });
  }

  create(data: Partial<ImageEntity>): ImageEntity {
    return this.imageRepo.create(data);
  }

  async save(image: ImageEntity): Promise<ImageEntity> {
    return await this.imageRepo.save(image);
  }

  async saveMany(images: ImageEntity[]): Promise<ImageEntity[]> {
    return await this.imageRepo.save(images);
  }

  async deleteByImageable(imageableType: ImageableType, imageableId: number): Promise<void> {
    await this.imageRepo.softDelete({ imageableType, imageableId });
  }

  async deleteById(id: number): Promise<void> {
    await this.imageRepo.softDelete(id);
  }

  async softDeleteByIds(ids: number[]): Promise<void> {
    if (!ids || ids.length === 0) {
      return;
    }
    await this.imageRepo.softDelete(ids);
  }
}
