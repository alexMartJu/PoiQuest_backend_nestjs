import { IsString, MaxLength, IsOptional, IsArray, IsUUID, ArrayMinSize } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRouteRequest {
  @ApiPropertyOptional({ maxLength: 255, description: 'Nombre de la ruta' })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Descripción de la ruta', example: null, nullable: true, type: String })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Lista ordenada de UUIDs de los POIs. El orden del array determina el sort_order. Si se envía, reemplaza completamente la lista anterior. Mínimo 2 POIs.',
    type: [String],
    example: ['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'],
  })
  @IsArray()
  @ArrayMinSize(2, { message: 'La ruta debe tener al menos 2 puntos de interés' })
  @IsUUID('all', { each: true })
  @IsOptional()
  poiUuids?: string[];
}
