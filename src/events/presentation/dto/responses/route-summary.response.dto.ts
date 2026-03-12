import { ApiProperty } from '@nestjs/swagger';

/// Resumen de ruta incluido en el detalle de evento (solo uuid y name)
export class RouteSummaryResponse {
  @ApiProperty({ description: 'UUID único de la ruta', example: '550e8400-e29b-41d4-a716-446655440000' })
  uuid!: string;

  @ApiProperty({ description: 'Nombre de la ruta' })
  name!: string;
}
