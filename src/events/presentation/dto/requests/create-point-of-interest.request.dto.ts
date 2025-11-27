import { IsString, IsOptional, MaxLength, IsUUID, IsNumber, IsObject, IsArray, ArrayMinSize, ArrayMaxSize, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePointOfInterestRequest {
  @ApiProperty({ description: 'UUID del evento al que pertenece el POI', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  eventUuid!: string;

  @ApiProperty({ maxLength: 255, description: 'Título del punto de interés' })
  @IsString()
  @MaxLength(255)
  title!: string;

  @ApiPropertyOptional({ maxLength: 255, description: 'Autor del POI', nullable: true, example: null, type: String })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  author?: string | null;

  @ApiPropertyOptional({ description: 'Descripción del POI', nullable: true, example: null, type: String })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiPropertyOptional({ description: 'Contenido multimedia en formato JSON', nullable: true, example: null, type: Object })
  @IsObject()
  @IsOptional()
  multimedia?: Record<string, any> | null;

  @ApiProperty({ maxLength: 255, description: 'Código QR único del POI' })
  @IsString()
  @MaxLength(255)
  qrCode!: string;

  @ApiPropertyOptional({ maxLength: 255, description: 'Tag NFC del POI', nullable: true, example: null, type: String })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  nfcTag?: string | null;

  @ApiPropertyOptional({ description: 'Coordenada X del POI', nullable: true, example: null, type: Number })
  @IsNumber()
  @IsOptional()
  coordX?: number | null;

  @ApiPropertyOptional({ description: 'Coordenada Y del POI', nullable: true, example: null, type: Number })
  @IsNumber()
  @IsOptional()
  coordY?: number | null;

  @ApiProperty({ 
    description: 'URLs de imágenes del POI (mínimo 1, máximo 2). La primera será la imagen principal.',
    example: ['https://example.com/poi-image1.jpg', 'https://example.com/poi-image2.jpg'],
    type: [String]
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe proporcionar al menos 1 imagen' })
  @ArrayMaxSize(2, { message: 'No puede proporcionar más de 2 imágenes' })
  @IsUrl({}, { each: true, message: 'Cada imagen debe ser una URL válida' })
  imageUrls!: string[];
}
