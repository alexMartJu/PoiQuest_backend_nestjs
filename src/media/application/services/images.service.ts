import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { ImageEntity } from '../../domain/entities/image.entity';
import { ImageableType } from '../../domain/enums/imageable-type.enum';
import { ImagesRepository } from '../../domain/repositories/images.repository';
import { AttachImagesDto } from '../dto/attach-images.dto';
import { UpdateImagesDto } from '../dto/update-images.dto';

@Injectable()
export class ImagesService {
  constructor(
    private readonly imagesRepo: ImagesRepository,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Adjunta imágenes a una entidad (event/poi).
   * La primera imagen será marcada como primaria.
   * Se espera que esta función se llame dentro de una transacción.
   */
  async attachImages(dto: AttachImagesDto, manager?: EntityManager): Promise<ImageEntity[]> {
    if (!dto.images || dto.images.length === 0) {
      return [];
    }
    const images = dto.images.map((imageInfo, index) =>
      this.imagesRepo.create({
        fileName: imageInfo.fileName,
        bucket: imageInfo.bucket,
        imageableType: dto.imageableType,
        imageableId: dto.imageableId,
        sortOrder: index,
        isPrimary: index === 0, // La primera es primaria
      }),
    );

    if (manager) {
      const repo = manager.getRepository(ImageEntity);
      return await repo.save(images);
    }

    return await this.imagesRepo.saveMany(images);
  }

  /**
   * Actualiza imágenes mediante reconciliación optimizada:
   * - Elimina las imágenes existentes que no están en la nueva lista (en bloque)
   * - Mantiene las que ya existen (mismo fileName y bucket)
   * - Agrega las nuevas (en bloque)
   * Se espera que esta función se llame dentro de una transacción.
   */
  async updateImages(dto: UpdateImagesDto, manager?: EntityManager): Promise<ImageEntity[]> {
    const repo = manager ? manager.getRepository(ImageEntity) : null;

    // Obtener imágenes existentes
    const existingImages: ImageEntity[] = manager
      ? await repo!.find({ where: { imageableType: dto.imageableType, imageableId: dto.imageableId } })
      : await this.imagesRepo.findByImageable(dto.imageableType, dto.imageableId);

    const existingKeys = existingImages.map(img => `${img.bucket}/${img.fileName}`);
    const newImages = dto.images || [];
    const newKeys = newImages.map(img => `${img.bucket}/${img.fileName}`);

    // Calcular IDs a eliminar
    const toDeleteIds = existingImages
      .filter(img => !newKeys.includes(`${img.bucket}/${img.fileName}`))
      .map(img => img.id);

    if (toDeleteIds.length > 0) {
      if (manager) {
        await repo!.softDelete(toDeleteIds);
      } else {
        await this.imagesRepo.softDeleteByIds(toDeleteIds);
      }
    }

    // Identificar imágenes a crear
    const toCreate = newImages.filter(img => !existingKeys.includes(`${img.bucket}/${img.fileName}`));

    if (toCreate.length > 0) {
      const imagesToSave = toCreate.map((imageInfo) =>
        this.imagesRepo.create({
          fileName: imageInfo.fileName,
          bucket: imageInfo.bucket,
          imageableType: dto.imageableType,
          imageableId: dto.imageableId,
          sortOrder: 0,
          isPrimary: false,
        }),
      );

      if (manager) {
        await repo!.save(imagesToSave);
      } else {
        await this.imagesRepo.saveMany(imagesToSave);
      }
    }

    // Recargar todas las imágenes y ajustar orden/primaria
    const allImages: ImageEntity[] = manager
      ? await repo!.find({ where: { imageableType: dto.imageableType, imageableId: dto.imageableId }, order: { sortOrder: 'ASC' } })
      : await this.imagesRepo.findByImageable(dto.imageableType, dto.imageableId);

    allImages.forEach(img => {
      const newIndex = newKeys.indexOf(`${img.bucket}/${img.fileName}`);
      if (newIndex !== -1) {
        img.sortOrder = newIndex;
        img.isPrimary = newIndex === 0;
      }
    });

    if (manager) {
      return await repo!.save(allImages);
    }

    return await this.imagesRepo.saveMany(allImages);
  }

  /**
   * Obtiene las imágenes de una entidad específica
   */
  async fetchImages(imageableType: ImageableType, imageableId: number): Promise<ImageEntity[]> {
    return await this.imagesRepo.findByImageable(imageableType, imageableId);
  }

  /**
   * Obtiene imágenes para múltiples entidades en una sola consulta (evita N+1)
   */
  async fetchImagesByIds(imageableType: ImageableType, imageableIds: number[]): Promise<ImageEntity[]> {
    return await this.imagesRepo.findByImageableIds(imageableType, imageableIds);
  }

  /**
   * Elimina todas las imágenes de una entidad
   */
  async deleteImagesByImageable(imageableType: ImageableType, imageableId: number): Promise<void> {
    await this.imagesRepo.deleteByImageable(imageableType, imageableId);
  }
}
