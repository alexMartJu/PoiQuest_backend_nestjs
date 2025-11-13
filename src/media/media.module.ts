import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageEntity } from './domain/entities/image.entity';
import { ImagesRepository } from './domain/repositories/images.repository';
import { TypeormImagesRepository } from './infrastructure/persistence/typeorm/typeorm-images.repository';
import { ImagesService } from './application/services/images.service';

@Module({
  imports: [TypeOrmModule.forFeature([ImageEntity])],
  providers: [
    {
      provide: ImagesRepository,
      useClass: TypeormImagesRepository,
    },
    ImagesService,
  ],
  exports: [ImagesService, ImagesRepository],
})
export class MediaModule {}
