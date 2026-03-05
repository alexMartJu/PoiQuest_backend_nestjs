import {
  IsString, IsOptional, MaxLength, IsDateString, IsUUID,
  IsArray, ArrayMinSize, ArrayMaxSize, IsBoolean,
  IsNumber, Min, IsInt, IsPositive,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

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

  @ApiProperty({ description: 'UUID de la ciudad donde se celebra el evento', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  cityUuid!: string;

  @ApiProperty({ description: 'UUID del organizador del evento', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  organizerUuid!: string;

  @ApiPropertyOptional({ description: 'UUID del patrocinador del evento', nullable: true, type: String, example: null })
  @IsUUID()
  @IsOptional()
  sponsorUuid?: string | null;

  @ApiProperty({ description: 'Indica si el evento es premium (requiere pago)', example: false })
  @IsBoolean()
  isPremium!: boolean;

  @ApiPropertyOptional({
    description: 'Precio del evento (solo si isPremium = true). Ej: 12.50',
    nullable: true,
    type: Number,
    minimum: 0,
    example: null,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number | null;

  @ApiPropertyOptional({
    description: 'Capacidad máxima de personas por día. null = sin límite.',
    nullable: true,
    type: Number,
    minimum: 1,
    example: null,
  })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  capacityPerDay?: number | null;

  @ApiProperty({ description: 'Fecha de inicio (formato: YYYY-MM-DD)', example: '2025-12-01' })
  @IsDateString()
  startDate!: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin (formato: YYYY-MM-DD)',
    example: '2025-12-31',
    nullable: true,
  })
  @IsDateString()
  @IsOptional()
  endDate?: string | null;

  @ApiProperty({
    description: 'Nombres de archivos de imágenes del evento almacenadas en MinIO (mínimo 1, máximo 2). La primera será la imagen principal.',
    example: ['1738996800000-event-photo1.jpg', '1738996800000-event-photo2.jpg'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe proporcionar al menos 1 imagen' })
  @ArrayMaxSize(2, { message: 'No puede proporcionar más de 2 imágenes' })
  @IsString({ each: true, message: 'Cada nombre de archivo debe ser una cadena válida' })
  imageFileNames!: string[];
}
