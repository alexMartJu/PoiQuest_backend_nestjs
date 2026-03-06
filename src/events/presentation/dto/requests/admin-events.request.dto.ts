import { IsEnum, IsOptional, IsString, IsISO8601, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { EventAdminFilter } from '../../../domain/enums/event-admin-filter.enum';

export class AdminEventsRequest {
  @ApiProperty({
    description: 'Filtro de estado para listar eventos. Opciones: pending (pendientes de activar), active (activos), finished (finalizados), deleted (eliminados con soft delete)',
    enum: EventAdminFilter,
    example: EventAdminFilter.PENDING,
  })
  @IsEnum(EventAdminFilter)
  filter!: EventAdminFilter;

  @ApiPropertyOptional({
    description: 'Cursor (createdAt del último evento de la página anterior en formato ISO 8601)',
    example: '2025-03-09T12:34:56.000Z',
  })
  @IsOptional()
  @IsString()
  @IsISO8601()
  cursor?: string;

  @ApiPropertyOptional({
    description: 'Número de eventos por página (mínimo: 1, máximo: 50)',
    example: 10,
    default: 10,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}
