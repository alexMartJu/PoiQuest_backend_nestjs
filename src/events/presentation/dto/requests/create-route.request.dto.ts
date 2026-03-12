import { IsString, MaxLength, IsOptional, IsArray, IsUUID, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRouteRequest {
  @ApiProperty({ description: 'UUID del evento al que pertenece la ruta', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  eventUuid!: string;

  @ApiProperty({ maxLength: 255, description: 'Nombre de la ruta' })
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({ description: 'Descripción de la ruta', example: null, nullable: true, type: String })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiProperty({
    description: 'Lista ordenada de UUIDs de los POIs que forman la ruta. El orden del array determina el sort_order. Mínimo 2 POIs. Todos deben pertenecer al mismo evento.',
    type: [String],
    example: ['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'],
  })
  @IsArray()
  @ArrayMinSize(2, { message: 'La ruta debe tener al menos 2 puntos de interés' })
  @IsUUID('all', { each: true })
  poiUuids!: string[];
}
