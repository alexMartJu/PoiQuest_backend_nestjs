import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NavigationPoiItem {
  @ApiProperty({ description: 'UUID del POI', example: '550e8400-e29b-41d4-a716-446655440000' })
  uuid!: string;

  @ApiProperty({ description: 'Título del punto de interés' })
  title!: string;

  @ApiPropertyOptional({ description: 'Coordenada X (longitud) del POI', nullable: true, type: Number })
  coordX?: number | null;

  @ApiPropertyOptional({ description: 'Coordenada Y (latitud) del POI', nullable: true, type: Number })
  coordY?: number | null;

  @ApiProperty({ description: 'Orden del POI dentro de la ruta', example: 1 })
  sortOrder!: number;

  @ApiProperty({ description: 'Indica si el POI ya fue escaneado por el usuario', example: false })
  scanned!: boolean;

  @ApiProperty({ description: 'Código QR del POI (deep link)' })
  qrCode!: string;
}

export class RouteNavigationResponse {
  @ApiProperty({ description: 'UUID de la ruta', example: '550e8400-e29b-41d4-a716-446655440000' })
  uuid!: string;

  @ApiProperty({ description: 'Nombre de la ruta' })
  name!: string;

  @ApiProperty({ type: [NavigationPoiItem], description: 'POIs de la ruta ordenados con coordenadas y estado de escaneo' })
  pois!: NavigationPoiItem[];
}
