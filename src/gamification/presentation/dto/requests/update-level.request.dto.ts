import { IsString, IsInt, IsOptional, MaxLength, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLevelRequest {
  @ApiPropertyOptional({ description: 'Número de nivel', example: 2 })
  @IsInt()
  @Min(1)
  @IsOptional()
  level?: number;

  @ApiPropertyOptional({ maxLength: 100, description: 'Título del nivel', example: 'Curioso' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Puntos mínimos para alcanzar este nivel', example: 150 })
  @IsInt()
  @Min(0)
  @IsOptional()
  minPoints?: number;

  @ApiPropertyOptional({ description: 'Porcentaje de descuento (0-100)', example: 3 })
  @IsInt()
  @Min(0)
  @IsOptional()
  discount?: number;

  @ApiPropertyOptional({ description: 'Descripción de la recompensa del nivel', nullable: true, example: '3% descuento en eventos premium' })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  reward?: string | null;
}
