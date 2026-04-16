import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExploreEventSummary {
  @ApiProperty({ description: 'UUID del evento', example: '550e8400-e29b-41d4-a716-446655440000' })
  uuid!: string;

  @ApiProperty({ description: 'Nombre del evento' })
  name!: string;

  @ApiPropertyOptional({ description: 'URL presigned de la imagen principal del evento', nullable: true })
  primaryImageUrl?: string | null;

  @ApiPropertyOptional({ description: 'Nombre de la ciudad del evento', nullable: true, example: 'Madrid' })
  cityName?: string | null;

  @ApiProperty({ description: 'Fecha de inicio (YYYY-MM-DD)', example: '2025-12-01' })
  startDate!: string;

  @ApiPropertyOptional({ description: 'Fecha de fin (YYYY-MM-DD)', nullable: true, example: '2025-12-31' })
  endDate?: string | null;
}

export class ExploreProgressSummary {
  @ApiProperty({ description: 'Número total de POIs del evento', example: 10 })
  totalPois!: number;

  @ApiProperty({ description: 'Número de POIs escaneados por el usuario', example: 3 })
  scannedPois!: number;
}

export class ExploreEventItem {
  @ApiProperty({ description: 'UUID del ticket del usuario', example: '550e8400-e29b-41d4-a716-446655440000' })
  ticketUuid!: string;

  @ApiProperty({ description: 'Fecha de visita del ticket (YYYY-MM-DD)', example: '2025-12-15' })
  visitDate!: string;

  @ApiProperty({ description: 'Estado del ticket', example: 'USED' })
  ticketStatus!: string;

  @ApiProperty({ type: ExploreEventSummary, description: 'Resumen del evento asociado al ticket' })
  event!: ExploreEventSummary;

  @ApiProperty({ type: ExploreProgressSummary, description: 'Progreso de exploración del usuario' })
  progress!: ExploreProgressSummary;
}

export class PaginatedExploreEventsResponse {
  @ApiProperty({ type: [ExploreEventItem], description: 'Lista de eventos de la página actual' })
  data!: ExploreEventItem[];

  @ApiPropertyOptional({
    description: 'Cursor para la siguiente página. Null si no hay más páginas.',
    nullable: true,
  })
  nextCursor?: string | null;

  @ApiProperty({ description: 'Indica si hay una página siguiente', example: true })
  hasNextPage!: boolean;
}
