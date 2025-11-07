import { IsString, IsOptional, MaxLength, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventRequest {
  @ApiProperty({ maxLength: 150, description: 'Nombre del evento' })
  @IsString()
  @MaxLength(150)
  name!: string;

  @ApiPropertyOptional({ description: 'Descripción del evento' })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiProperty({ description: 'UUID de la categoría del evento', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  categoryUuid!: string;

  @ApiPropertyOptional({ maxLength: 255, description: 'Ubicación del evento' })
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
}
