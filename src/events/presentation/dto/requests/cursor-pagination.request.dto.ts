import { IsOptional, IsString, IsInt, Min, Max, IsISO8601 } from 'class-validator';
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
}
