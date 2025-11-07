import { IsString, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventCategoryRequest {
  @ApiProperty({ maxLength: 150, description: 'Nombre de la categoría' })
  @IsString()
  @MaxLength(150)
  name!: string;

  @ApiPropertyOptional({ description: 'Descripción de la categoría' })
  @IsString()
  @IsOptional()
  description?: string | null;
}
