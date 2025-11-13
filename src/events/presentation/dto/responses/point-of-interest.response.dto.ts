import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventResponse } from './event.response.dto';
import { ImageResponse } from '../../../../media/presentation/dto/image.response.dto';

export class PointOfInterestResponse {
  @ApiProperty({ description: 'UUID único del POI', example: '550e8400-e29b-41d4-a716-446655440000' })
  uuid!: string;

  @ApiPropertyOptional({ type: EventResponse, description: 'Evento al que pertenece el POI', nullable: true })
  event!: EventResponse | null;

  @ApiProperty({ description: 'Título del punto de interés' })
  title!: string;

  @ApiPropertyOptional({ description: 'Autor del POI', nullable: true })
  author!: string | null;

  @ApiPropertyOptional({ description: 'Descripción del POI', nullable: true })
  description!: string | null;

  @ApiPropertyOptional({ description: 'Contenido multimedia en formato JSON', nullable: true })
  multimedia!: Record<string, any> | null;

  @ApiProperty({ description: 'Código QR único del POI' })
  qrCode!: string;

  @ApiPropertyOptional({ description: 'Tag NFC del POI', nullable: true })
  nfcTag!: string | null;

  @ApiPropertyOptional({ description: 'Coordenada X del POI', nullable: true })
  coordX!: number | null;

  @ApiPropertyOptional({ description: 'Coordenada Y del POI', nullable: true })
  coordY!: number | null;

  @ApiPropertyOptional({ 
    type: [ImageResponse], 
    description: 'Imágenes del POI',
    nullable: true
  })
  images?: ImageResponse[] | null;

  @ApiProperty({ 
    description: 'Fecha de creación en ISO 8601',
    example: '2025-11-04T23:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  createdAt!: Date;

  @ApiProperty({ 
    description: 'Fecha de última actualización en ISO 8601',
    example: '2025-11-04T23:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  updatedAt!: Date;
}
