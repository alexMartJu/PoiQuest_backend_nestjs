import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ScanResultResponse {
  @ApiProperty({ description: 'ID del registro de escaneo' })
  uuid!: string;

  @ApiProperty({ description: 'UUID del POI escaneado', example: '550e8400-e29b-41d4-a716-446655440000' })
  poiUuid!: string;

  @ApiProperty({ description: 'Título del punto de interés escaneado' })
  poiTitle!: string;

  @ApiPropertyOptional({ description: 'Datos interesantes del POI para mostrar en AR', nullable: true })
  interestingData?: string | null;

  @ApiPropertyOptional({ description: 'URL presigned del modelo 3D (.glb) para AR', nullable: true })
  modelUrl?: string | null;

  @ApiProperty({
    description: 'Fecha y hora del escaneo en ISO 8601',
    example: '2025-12-15T10:30:00.000Z',
    type: String,
    format: 'date-time',
  })
  scannedAt!: Date;
}
