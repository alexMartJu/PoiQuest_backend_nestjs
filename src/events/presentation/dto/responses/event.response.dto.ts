import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventType } from '../../../domain/enums/event-type.enum';

export class EventResponse {
  @ApiProperty({ description: 'UUID único del evento', example: '550e8400-e29b-41d4-a716-446655440000' })
  uuid!: string;

  @ApiProperty({ description: 'Nombre del evento' })
  name!: string;

  @ApiPropertyOptional({ description: 'Descripción del evento', nullable: true })
  description!: string | null;

  @ApiProperty({ enum: EventType, description: 'Tipo de evento' })
  type!: EventType;

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
