import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LevelResponse {
  @ApiProperty({ description: 'UUID único del nivel', example: '550e8400-e29b-41d4-a716-446655440000' })
  uuid!: string;

  @ApiProperty({ description: 'Número de nivel (1 = principiante, 5 = máximo)', example: 1 })
  level!: number;

  @ApiProperty({ description: 'Título del nivel', example: 'Explorador' })
  title!: string;

  @ApiProperty({ description: 'Puntos mínimos necesarios para alcanzar este nivel', example: 0 })
  minPoints!: number;

  @ApiProperty({ description: 'Porcentaje de descuento en eventos premium (%)', example: 0 })
  discount!: number;

  @ApiPropertyOptional({
    description: 'Recompensa especial al alcanzar este nivel',
    nullable: true,
    example: 'Inicio de la aventura',
  })
  reward!: string | null;

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
