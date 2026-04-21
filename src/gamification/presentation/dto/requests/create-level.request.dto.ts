import { IsString, IsInt, IsOptional, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLevelRequest {
  @ApiProperty({ description: 'Número de nivel (debe ser único)', example: 1 })
  @IsInt()
  @Min(1)
  level!: number;

  @ApiProperty({ maxLength: 100, description: 'Título del nivel', example: 'Explorador' })
  @IsString()
  @MaxLength(100)
  title!: string;

  @ApiProperty({ description: 'Puntos mínimos para alcanzar este nivel', example: 0 })
  @IsInt()
  @Min(0)
  minPoints!: number;

  @ApiPropertyOptional({ description: 'Porcentaje de descuento (0-100)', example: 0, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  discount?: number;

  @ApiPropertyOptional({ description: 'Descripción de la recompensa del nivel', nullable: true, example: 'Badge exclusivo' })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  reward?: string | null;
}
