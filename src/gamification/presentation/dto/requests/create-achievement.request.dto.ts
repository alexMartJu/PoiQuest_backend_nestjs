import { IsString, IsInt, IsOptional, IsEnum, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AchievementCategory } from '../../../domain/entities/achievement.entity';

export class CreateAchievementRequest {
  @ApiProperty({ maxLength: 100, description: 'Clave única del logro', example: 'scan_1' })
  @IsString()
  @MaxLength(100)
  key!: string;

  @ApiProperty({ maxLength: 100, description: 'Nombre del logro', example: 'Primer descubrimiento' })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ description: 'Descripción del logro', nullable: true, example: 'Escanea tu primer punto de interés' })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiProperty({ enum: AchievementCategory, description: 'Categoría del logro', example: AchievementCategory.EXPLORATION })
  @IsEnum(AchievementCategory)
  category!: AchievementCategory;

  @ApiProperty({ description: 'Umbral de acciones necesarias para desbloquear', example: 1 })
  @IsInt()
  @Min(1)
  threshold!: number;

  @ApiProperty({ description: 'Puntos que otorga al desbloquearse', example: 20 })
  @IsInt()
  @Min(0)
  points!: number;
}
