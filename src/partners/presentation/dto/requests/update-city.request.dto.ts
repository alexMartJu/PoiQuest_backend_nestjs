import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MaxLength, IsOptional } from 'class-validator';

export class UpdateCityRequest {
  @ApiPropertyOptional({ maxLength: 150, description: 'Nombre de la ciudad', example: 'Madrid' })
  @IsString()
  @MaxLength(150)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ maxLength: 100, description: 'País', example: 'España' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ maxLength: 100, description: 'Región o comunidad autónoma', nullable: true, type: String })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  region?: string | null;

  @ApiPropertyOptional({ description: 'Descripción de la ciudad', nullable: true, type: String })
  @IsString()
  @IsOptional()
  description?: string | null;
}
