import { IsOptional, IsString, IsInt, Min, Max, IsISO8601, IsUUID, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CursorPaginationRequest {
  @ApiPropertyOptional({ 
    description: 'Cursor (createdAt del último evento de la página anterior en formato ISO 8601)',
    example: '2025-03-09T12:34:56.000Z'
  })
  @IsOptional()
  @IsString()
  @IsISO8601()
  cursor?: string;

  @ApiPropertyOptional({ 
    description: 'Número de eventos por página (mínimo: 1, máximo: 50)',
    example: 3,
    default: 3,
    minimum: 1,
    maximum: 50
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 3;

  @ApiPropertyOptional({
    description: 'UUID de la ciudad para filtrar eventos',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  cityUuid?: string;

  @ApiPropertyOptional({
    description: 'Precio mínimo para filtrar eventos (EUR)',
    example: 0,
  })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Precio máximo para filtrar eventos (EUR)',
    example: 100,
  })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Fecha de inicio mínima (YYYY-MM-DD) para filtrar eventos',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin máxima (YYYY-MM-DD) para filtrar eventos',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsString()
  endDate?: string;
}
