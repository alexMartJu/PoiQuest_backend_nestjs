import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreateCityRequest {
  @ApiProperty({ maxLength: 150, description: 'Nombre de la ciudad', example: 'Madrid' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name!: string;

  @ApiProperty({ maxLength: 100, description: 'País', example: 'España' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  country!: string;

  @ApiPropertyOptional({ maxLength: 100, description: 'Región o comunidad autónoma', nullable: true, type: String, example: 'Comunidad de Madrid' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  region?: string | null;

  @ApiPropertyOptional({ description: 'Descripción de la ciudad', nullable: true, type: String, example: null })
  @IsString()
  @IsOptional()
  description?: string | null;
}
