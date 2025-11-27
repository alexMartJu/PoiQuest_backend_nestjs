import { IsString, MaxLength, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateEventCategoryRequest {
  @ApiPropertyOptional({ maxLength: 150, description: 'Nombre de la categoría' })
  @IsString()
  @MaxLength(150)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Descripción de la categoría', example: null, nullable: true, type: String })
  @IsString()
  @IsOptional()
  description?: string | null;
}
