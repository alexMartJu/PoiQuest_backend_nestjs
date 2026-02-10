import { ImageEntity } from '../../domain/entities/image.entity';
import { ImageResponse } from '../dto/image.response.dto';

export class ImageMapper {
  static toResponse(image: ImageEntity, presignedUrl?: string): ImageResponse {
    return {
      id: image.id,
      fileName: image.fileName,
      bucket: image.bucket,
      url: presignedUrl || '', // URL presigned generada por el servicio
      sortOrder: image.sortOrder,
      isPrimary: image.isPrimary,
      createdAt: image.createdAt,
    };
  }

  static toResponseList(images: ImageEntity[], presignedUrls?: Map<number, string>): ImageResponse[] {
    return images.map(img => ImageMapper.toResponse(img, presignedUrls?.get(img.id)));
  }
}
