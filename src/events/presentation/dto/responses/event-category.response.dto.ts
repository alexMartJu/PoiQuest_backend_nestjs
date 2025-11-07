import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EventCategoryResponse {
  @ApiProperty({ description: 'UUID único de la categoría', example: '550e8400-e29b-41d4-a716-446655440000' })
  uuid!: string;

  @ApiProperty({ description: 'Nombre de la categoría' })
  name!: string;

  @ApiPropertyOptional({ description: 'Descripción de la categoría', nullable: true })
  description!: string | null;

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
