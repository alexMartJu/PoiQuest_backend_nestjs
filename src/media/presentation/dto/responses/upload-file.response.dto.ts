import { ApiProperty } from '@nestjs/swagger';

export class UploadFileResponse {
  @ApiProperty({ 
    description: 'Mensaje de confirmación',
    example: 'Archivo subido exitosamente'
  })
  message!: string;

  @ApiProperty({ 
    description: 'Nombre del archivo en MinIO',
    example: '1738996800000-photo.jpg'
  })
  fileName!: string;

  @ApiProperty({ 
    description: 'Bucket donde se almacenó',
    example: 'images'
  })
  bucket!: string;

  @ApiProperty({ 
    description: 'URL presigned para acceder al archivo (válida por 24 horas)',
    example: 'http://minio:9000/images/1738996800000-photo.jpg?X-Amz-Algorithm=...'
  })
  url!: string;
}
