import { ApiProperty } from '@nestjs/swagger';

export class PresignedUrlResponse {
  @ApiProperty({ 
    description: 'URL presigned para acceder al archivo',
    example: 'http://minio:9000/images/1738996800000-photo.jpg?X-Amz-Algorithm=...'
  })
  url!: string;

  @ApiProperty({ 
    description: 'Tiempo de expiración en segundos',
    example: 86400
  })
  expiresIn!: number;
}
