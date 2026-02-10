import { IsString, IsOptional, MaxLength, IsDateString, IsUUID, IsArray, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventRequest {
  @ApiProperty({ maxLength: 150, description: 'Nombre del evento' })
  @IsString()
  @MaxLength(150)
  name!: string;

  @ApiPropertyOptional({ description: 'Descripción del evento', example: null, nullable: true, type: String })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiProperty({ description: 'UUID de la categoría del evento', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  categoryUuid!: string;

  @ApiPropertyOptional({ maxLength: 255, description: 'Ubicación del evento', example: null, nullable: true, type: String })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  location?: string | null;

  @ApiProperty({ description: 'Fecha de inicio (formato: YYYY-MM-DD)', example: '2025-12-01' })
  @IsDateString()
  startDate!: string;

  @ApiPropertyOptional({ 
    description: 'Fecha de fin (formato: YYYY-MM-DD)', 
    example: '2025-12-31',
    nullable: true 
  })
  @IsDateString()
  @IsOptional()
  endDate?: string | null;

  @ApiProperty({ 
    description: 'Nombres de archivos de imágenes del evento almacenadas en MinIO (mínimo 1, máximo 2). La primera será la imagen principal.',
    example: ['1738996800000-event-photo1.jpg', '1738996800000-event-photo2.jpg'],
    type: [String]
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe proporcionar al menos 1 imagen' })
  @ArrayMaxSize(2, { message: 'No puede proporcionar más de 2 imágenes' })
  @IsString({ each: true, message: 'Cada nombre de archivo debe ser una cadena válida' })
  imageFileNames!: string[];
}
