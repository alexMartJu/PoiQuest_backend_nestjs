import { IsString, IsOptional, MaxLength, IsNumber, IsObject, IsArray, ArrayMaxSize, IsUrl } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePointOfInterestRequest {
  @ApiPropertyOptional({ maxLength: 255, description: 'Título del punto de interés' })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ maxLength: 255, description: 'Autor del POI', nullable: true })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  author?: string | null;

  @ApiPropertyOptional({ description: 'Descripción del POI', nullable: true })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiPropertyOptional({ description: 'Contenido multimedia en formato JSON', nullable: true })
  @IsObject()
  @IsOptional()
  multimedia?: Record<string, any> | null;

  @ApiPropertyOptional({ maxLength: 255, description: 'Código QR único del POI' })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  qrCode?: string;

  @ApiPropertyOptional({ maxLength: 255, description: 'Tag NFC del POI', nullable: true })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  nfcTag?: string | null;

  @ApiPropertyOptional({ description: 'Coordenada X del POI', nullable: true })
  @IsNumber()
  @IsOptional()
  coordX?: number | null;

  @ApiPropertyOptional({ description: 'Coordenada Y del POI', nullable: true })
  @IsNumber()
  @IsOptional()
  coordY?: number | null;

  @ApiPropertyOptional({ 
    description: 'URLs de imágenes del POI (máximo 2). La primera será la imagen principal.',
    example: ['https://example.com/poi-image1.jpg'],
    type: [String]
  })
  @IsArray()
  @ArrayMaxSize(2, { message: 'No puede proporcionar más de 2 imágenes' })
  @IsUrl({}, { each: true, message: 'Cada imagen debe ser una URL válida' })
  @IsOptional()
  imageUrls?: string[];
}
