import { IsString, IsOptional, IsNotEmpty, MaxLength, IsNumber, IsArray, ArrayMaxSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePointOfInterestRequest {
  @ApiPropertyOptional({ maxLength: 255, description: 'Título del punto de interés' })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ maxLength: 255, description: 'Autor del POI', nullable: true, example: null, type: String })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  author?: string | null;

  @ApiPropertyOptional({ description: 'Descripción del POI', nullable: true, example: null, type: String })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiProperty({ description: 'Datos interesantes del POI (texto libre para mostrar en AR)' })
  @IsString()
  @IsNotEmpty({ message: 'Los datos interesantes son obligatorios' })
  interestingData!: string;

  @ApiProperty({ maxLength: 500, description: 'Nombre del archivo .glb en MinIO (bucket models)' })
  @IsString()
  @IsNotEmpty({ message: 'El modelo 3D (.glb) es obligatorio' })
  @MaxLength(500)
  modelFileName!: string;

  @ApiPropertyOptional({ description: 'Coordenada X del POI', nullable: true, example: null, type: Number })
  @IsNumber()
  @IsOptional()
  coordX?: number | null;

  @ApiPropertyOptional({ description: 'Coordenada Y del POI', nullable: true, example: null, type: Number })
  @IsNumber()
  @IsOptional()
  coordY?: number | null;

  @ApiPropertyOptional({ 
    description: 'Nombres de archivos de imágenes del POI almacenadas en MinIO (máximo 2). La primera será la imagen principal.',
    example: ['1738996800000-poi-photo1.jpg'],
    type: [String]
  })
  @IsArray()
  @ArrayMaxSize(2, { message: 'No puede proporcionar más de 2 imágenes' })
  @IsString({ each: true, message: 'Cada nombre de archivo debe ser una cadena válida' })
  @IsOptional()
  imageFileNames?: string[];
}
