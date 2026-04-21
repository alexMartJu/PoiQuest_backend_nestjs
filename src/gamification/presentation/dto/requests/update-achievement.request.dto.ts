import { IsString, IsInt, IsOptional, IsEnum, MaxLength, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AchievementCategory } from '../../../domain/entities/achievement.entity';

export class UpdateAchievementRequest {
  @ApiPropertyOptional({ maxLength: 100, description: 'Clave única del logro', example: 'scan_1' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  key?: string;

  @ApiPropertyOptional({ maxLength: 100, description: 'Nombre del logro', example: 'Primer descubrimiento' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Descripción del logro', nullable: true, example: 'Escanea tu primer punto de interés' })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiPropertyOptional({ enum: AchievementCategory, description: 'Categoría del logro', example: AchievementCategory.EXPLORATION })
  @IsEnum(AchievementCategory)
  @IsOptional()
  category?: AchievementCategory;

  @ApiPropertyOptional({ description: 'Umbral de acciones necesarias para desbloquear', example: 5 })
  @IsInt()
  @Min(1)
  @IsOptional()
  threshold?: number;

  @ApiPropertyOptional({ description: 'Puntos que otorga al desbloquearse', example: 40 })
  @IsInt()
  @Min(0)
  @IsOptional()
  points?: number;
}
