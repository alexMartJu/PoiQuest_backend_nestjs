import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PointOfInterestResponse } from './point-of-interest.response.dto';

export class RoutePoiResponse {
  @ApiProperty({ description: 'Orden del POI dentro de la ruta (1-based)', example: 1 })
  sortOrder!: number;

  @ApiProperty({ type: PointOfInterestResponse, description: 'Datos del punto de interés' })
  poi!: Omit<PointOfInterestResponse, 'event'>;
}

export class RouteResponse {
  @ApiProperty({ description: 'UUID único de la ruta', example: '550e8400-e29b-41d4-a716-446655440000' })
  uuid!: string;

  @ApiProperty({ description: 'Nombre de la ruta' })
  name!: string;

  @ApiPropertyOptional({ description: 'Descripción de la ruta', nullable: true })
  description!: string | null;

  @ApiProperty({ type: [RoutePoiResponse], description: 'POIs de la ruta ordenados por sort_order' })
  pois!: RoutePoiResponse[];

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
