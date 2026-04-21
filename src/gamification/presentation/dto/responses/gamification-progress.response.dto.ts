import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AchievementResponse {
  @ApiProperty({ description: 'ID interno del logro', example: 1 })
  id!: number;

  @ApiProperty({ description: 'Clave única del logro', example: 'exploration_10' })
  key!: string;

  @ApiProperty({ description: 'Nombre del logro', example: 'Explorador Novato' })
  name!: string;

  @ApiPropertyOptional({ description: 'Descripción del logro', nullable: true, example: 'Escanea 10 puntos de interés' })
  description!: string | null;

  @ApiProperty({
    description: 'Categoría del logro',
    enum: ['exploration', 'routes', 'premium_events'],
    example: 'exploration',
  })
  category!: string;

  @ApiProperty({ description: 'Umbral de acciones necesarias para desbloquear el logro', example: 10 })
  threshold!: number;

  @ApiProperty({ description: 'Puntos que otorga el logro al desbloquearse', example: 50 })
  points!: number;

  @ApiProperty({ description: 'Indica si el usuario tiene el logro desbloqueado', example: false })
  unlocked!: boolean;
}

export class GamificationStatsResponse {
  @ApiProperty({ description: 'Total de POIs escaneados por el usuario', example: 5 })
  totalScans!: number;

  @ApiProperty({ description: 'Rutas completadas por el usuario', example: 2 })
  completedRoutes!: number;

  @ApiProperty({ description: 'Tickets premium comprados por el usuario', example: 1 })
  paidTickets!: number;

  @ApiProperty({ description: 'Tickets premium usados (eventos asistidos)', example: 1 })
  usedPaidTickets!: number;
}

export class LevelInfoResponse {
  @ApiProperty({ description: 'Número de nivel', example: 1 })
  level!: number;

  @ApiProperty({ description: 'Título del nivel', example: 'Explorador' })
  title!: string;

  @ApiProperty({ description: 'Puntos mínimos para alcanzar este nivel', example: 0 })
  minPoints!: number;

  @ApiProperty({ description: 'Porcentaje de descuento en eventos premium (%)', example: 0 })
  discount!: number;

  @ApiPropertyOptional({ description: 'Recompensa especial al alcanzar este nivel', nullable: true, example: 'Inicio de la aventura' })
  reward!: string | null;
}

export class GamificationProgressResponse {
  @ApiProperty({ description: 'Puntos totales acumulados por el usuario', example: 120 })
  totalPoints!: number;

  @ApiProperty({ description: 'Número del nivel actual del usuario', example: 2 })
  level!: number;

  @ApiProperty({ description: 'Título del nivel actual', example: 'Curioso' })
  levelTitle!: string;

  @ApiProperty({ description: 'Puntos mínimos del nivel actual', example: 150 })
  currentLevelMinPoints!: number;

  @ApiPropertyOptional({ description: 'Puntos mínimos del siguiente nivel (null si es el nivel máximo)', nullable: true, example: 400 })
  nextLevelMinPoints!: number | null;

  @ApiProperty({ description: 'Porcentaje de descuento aplicable en eventos premium (%)', example: 0 })
  discount!: number;

  @ApiProperty({ description: 'Estadísticas de actividad del usuario', type: GamificationStatsResponse })
  stats!: GamificationStatsResponse;

  @ApiProperty({ description: 'Lista completa de logros con su estado de desbloqueo', type: [AchievementResponse] })
  achievements!: AchievementResponse[];

  @ApiProperty({ description: 'Lista de todos los niveles disponibles', type: [LevelInfoResponse] })
  levels!: LevelInfoResponse[];
}
