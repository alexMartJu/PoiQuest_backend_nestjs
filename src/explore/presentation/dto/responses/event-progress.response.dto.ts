import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProgressPoiItem {
  @ApiProperty({ description: 'UUID del POI', example: '550e8400-e29b-41d4-a716-446655440000' })
  uuid!: string;

  @ApiProperty({ description: 'Título del punto de interés' })
  title!: string;

  @ApiProperty({ description: 'Orden del POI dentro de la ruta', example: 1 })
  sortOrder!: number;

  @ApiProperty({ description: 'Indica si el POI ya fue escaneado por el usuario', example: false })
  scanned!: boolean;

  @ApiPropertyOptional({ description: 'Coordenada X (longitud) del POI', nullable: true, type: Number })
  coordX?: number | null;

  @ApiPropertyOptional({ description: 'Coordenada Y (latitud) del POI', nullable: true, type: Number })
  coordY?: number | null;
}

export class ProgressRouteItem {
  @ApiProperty({ description: 'UUID de la ruta', example: '550e8400-e29b-41d4-a716-446655440000' })
  uuid!: string;

  @ApiProperty({ description: 'Nombre de la ruta' })
  name!: string;

  @ApiPropertyOptional({ description: 'Descripción de la ruta', nullable: true })
  description?: string | null;

  @ApiProperty({ description: 'Número total de POIs en la ruta', example: 5 })
  totalPois!: number;

  @ApiProperty({ description: 'Número de POIs escaneados en la ruta', example: 2 })
  scannedPois!: number;

  @ApiProperty({ type: [ProgressPoiItem], description: 'Lista de POIs de la ruta con estado de escaneo' })
  pois!: ProgressPoiItem[];
}

export class ProgressEventInfo {
  @ApiProperty({ description: 'UUID del evento', example: '550e8400-e29b-41d4-a716-446655440000' })
  uuid!: string;

  @ApiProperty({ description: 'Nombre del evento' })
  name!: string;

  @ApiPropertyOptional({ description: 'Descripción del evento', nullable: true })
  description?: string | null;

  @ApiPropertyOptional({ description: 'URL presigned de la imagen principal del evento', nullable: true })
  primaryImageUrl?: string | null;

  @ApiPropertyOptional({ description: 'Nombre de la ciudad del evento', nullable: true, example: 'Madrid' })
  cityName?: string | null;

  @ApiProperty({ description: 'Fecha de inicio (YYYY-MM-DD)', example: '2025-12-01' })
  startDate!: string;

  @ApiPropertyOptional({ description: 'Fecha de fin (YYYY-MM-DD)', nullable: true, example: '2025-12-31' })
  endDate?: string | null;
}

export class EventProgressResponse {
  @ApiProperty({ description: 'UUID del ticket del usuario', example: '550e8400-e29b-41d4-a716-446655440000' })
  ticketUuid!: string;

  @ApiProperty({ description: 'Fecha de visita del ticket (YYYY-MM-DD)', example: '2025-12-15' })
  visitDate!: string;

  @ApiProperty({ description: 'Estado del ticket', example: 'USED' })
  ticketStatus!: string;

  @ApiProperty({ type: ProgressEventInfo, description: 'Información del evento' })
  event!: ProgressEventInfo;

  @ApiProperty({ description: 'Número total de POIs del evento', example: 10 })
  totalPois!: number;

  @ApiProperty({ description: 'Número de POIs escaneados en el evento', example: 3 })
  scannedPois!: number;

  @ApiProperty({ type: [ProgressRouteItem], description: 'Rutas del evento con progreso de escaneo' })
  routes!: ProgressRouteItem[];
}
