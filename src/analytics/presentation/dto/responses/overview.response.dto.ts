import { ApiProperty } from '@nestjs/swagger';

export class OverviewResponse {
  @ApiProperty({ description: 'Total de usuarios registrados' })
  totalUsers!: number;

  @ApiProperty({ description: 'Total de usuarios activos' })
  activeUsers!: number;

  @ApiProperty({ description: 'Usuarios creados en los últimos 7 días' })
  recentUsers!: number;

  @ApiProperty({ description: 'Total de eventos (sin eliminar)' })
  totalEvents!: number;

  @ApiProperty({ description: 'Total de eventos activos' })
  activeEvents!: number;

  @ApiProperty({ description: 'Total de puntos de interés' })
  totalPois!: number;
}
