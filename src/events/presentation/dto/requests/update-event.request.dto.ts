import { IsString, IsEnum, IsOptional, MaxLength, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EventType } from '../../../domain/enums/event-type.enum';

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

  @ApiPropertyOptional({ enum: EventType, description: 'Tipo de evento' })
  @IsEnum(EventType)
  @IsOptional()
  type?: EventType;

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
}
