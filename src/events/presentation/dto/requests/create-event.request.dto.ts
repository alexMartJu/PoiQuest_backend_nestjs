import { IsString, IsEnum, IsOptional, MaxLength, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventType } from '../../../domain/enums/event-type.enum';

export class CreateEventRequest {
  @ApiProperty({ maxLength: 150, description: 'Nombre del evento' })
  @IsString()
  @MaxLength(150)
  name!: string;

  @ApiPropertyOptional({ description: 'Descripción del evento' })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiProperty({ enum: EventType, description: 'Tipo de evento' })
  @IsEnum(EventType)
  type!: EventType;

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
