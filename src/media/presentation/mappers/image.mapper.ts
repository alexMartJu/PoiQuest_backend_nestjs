import { ImageEntity } from '../../domain/entities/image.entity';
import { ImageResponse } from '../dto/image.response.dto';

export class ImageMapper {
  static toResponse(image: ImageEntity): ImageResponse {
    return {
      id: image.id,
      imageUrl: image.imageUrl,
      sortOrder: image.sortOrder,
      isPrimary: image.isPrimary,
      createdAt: image.createdAt,
    };
  }

  static toResponseList(images: ImageEntity[]): ImageResponse[] {
    return images.map(ImageMapper.toResponse);
  }
}
