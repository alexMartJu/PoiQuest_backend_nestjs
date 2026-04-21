import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AchievementAdminResponse {
  @ApiProperty({ description: 'UUID único del logro', example: '550e8400-e29b-41d4-a716-446655440000' })
  uuid!: string;

  @ApiProperty({ description: 'Clave única del logro (usada internamente)', example: 'exploration_10' })
  key!: string;

  @ApiProperty({ description: 'Nombre visible del logro', example: 'Explorador Novato' })
  name!: string;

  @ApiPropertyOptional({
    description: 'Descripción del logro',
    nullable: true,
    example: 'Escanea 10 puntos de interés',
  })
  description!: string | null;

  @ApiProperty({
    description: 'Categoría del logro',
    enum: ['exploration', 'routes', 'premium_events'],
    example: 'exploration',
  })
  category!: string;

  @ApiProperty({ description: 'Número de acciones necesarias para desbloquear el logro', example: 10 })
  threshold!: number;

  @ApiProperty({ description: 'Puntos que otorga el logro al desbloquearse', example: 50 })
  points!: number;

  @ApiProperty({
    description: 'Fecha de creación del registro',
    type: String,
    format: 'date-time',
    example: '2025-01-01T00:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Fecha de última actualización del registro',
    type: String,
    format: 'date-time',
    example: '2025-01-01T00:00:00.000Z',
  })
  updatedAt!: Date;
}
