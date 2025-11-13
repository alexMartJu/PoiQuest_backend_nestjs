import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventStatus } from '../../../domain/enums/event-status.enum';
import { EventCategoryResponse } from './event-category.response.dto';
import { PointOfInterestResponse } from './point-of-interest.response.dto';
import { ImageResponse } from '../../../../media/presentation/dto/image.response.dto';

export class EventResponse {
  @ApiProperty({ description: 'UUID único del evento', example: '550e8400-e29b-41d4-a716-446655440000' })
  uuid!: string;

  @ApiProperty({ description: 'Nombre del evento' })
  name!: string;

  @ApiPropertyOptional({ description: 'Descripción del evento', nullable: true })
  description!: string | null;

  @ApiPropertyOptional({ type: EventCategoryResponse, description: 'Categoría del evento', nullable: true })
  category!: EventCategoryResponse | null;

  @ApiProperty({ enum: EventStatus, description: 'Estado del evento (active/finished)' })
  status!: EventStatus;

  @ApiPropertyOptional({ description: 'Ubicación del evento', nullable: true })
  location!: string | null;

  @ApiProperty({ description: 'Fecha de inicio (YYYY-MM-DD)', example: '2025-12-01' })
  startDate!: string;

  @ApiPropertyOptional({ 
    description: 'Fecha de fin (YYYY-MM-DD)', 
    example: '2025-12-31',
    nullable: true 
  })
  endDate!: string | null;

  @ApiPropertyOptional({ 
    type: [PointOfInterestResponse], 
    description: 'Lista de puntos de interés asociados al evento',
    nullable: true
  })
  pointsOfInterest?: Omit<PointOfInterestResponse, 'event'>[] | null;

  @ApiProperty({ type: [ImageResponse], description: 'Imágenes del evento' })
  images!: ImageResponse[];

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
