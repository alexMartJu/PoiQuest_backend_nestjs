import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageEntity } from './domain/entities/image.entity';
import { ImagesRepository } from './domain/repositories/images.repository';
import { TypeormImagesRepository } from './infrastructure/persistence/typeorm/typeorm-images.repository';
import { ImagesService } from './application/services/images.service';
import { FilesService } from './application/services/files.service';
import { FilesController } from './presentation/controllers/files.controller';
import { MinioClientModule } from '../minio-client/minio-client.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ImageEntity]),
    MinioClientModule,
  ],
  controllers: [FilesController],
  providers: [
    {
      provide: ImagesRepository,
      useClass: TypeormImagesRepository,
    },
    ImagesService,
    FilesService,
  ],
  exports: [ImagesService, ImagesRepository, FilesService],
})
export class MediaModule {}
