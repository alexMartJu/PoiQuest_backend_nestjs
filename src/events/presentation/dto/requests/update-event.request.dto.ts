import { IsString, IsOptional, MaxLength, IsDateString, IsUUID, IsArray, ArrayMaxSize, IsUrl } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateEventRequest {
  @ApiPropertyOptional({ maxLength: 150, description: 'Nombre del evento' })
  @IsString()
  @MaxLength(150)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Descripción del evento', nullable: true })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiPropertyOptional({ description: 'UUID de la categoría del evento', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  @IsOptional()
  categoryUuid?: string;

  @ApiPropertyOptional({ maxLength: 255, description: 'Ubicación del evento', nullable: true })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  location?: string | null;

  @ApiPropertyOptional({ description: 'Fecha de inicio (formato: YYYY-MM-DD)', example: '2025-12-01' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ 
    description: 'Fecha de fin (formato: YYYY-MM-DD)', 
    example: '2025-12-31',
    nullable: true 
  })
  @IsDateString()
  @IsOptional()
  endDate?: string | null;

  @ApiPropertyOptional({ 
    description: 'URLs de imágenes del evento (máximo 2). La primera será la imagen principal.',
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    type: [String]
  })
  @IsArray()
  @ArrayMaxSize(2, { message: 'No puede proporcionar más de 2 imágenes' })
  @IsUrl({}, { each: true, message: 'Cada imagen debe ser una URL válida' })
  @IsOptional()
  imageUrls?: string[];
}
