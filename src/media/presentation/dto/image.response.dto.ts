import { ApiProperty } from '@nestjs/swagger';

export class ImageResponse {
  @ApiProperty({ description: 'ID de la imagen' })
  id!: number;

  @ApiProperty({ description: 'URL de la imagen' })
  imageUrl!: string;

  @ApiProperty({ description: 'Orden de visualización' })
  sortOrder!: number;

  @ApiProperty({ description: 'Indica si es la imagen principal' })
  isPrimary!: boolean;

  @ApiProperty({ 
    description: 'Fecha de creación en ISO 8601',
    example: '2025-11-04T23:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  createdAt!: Date;
}
