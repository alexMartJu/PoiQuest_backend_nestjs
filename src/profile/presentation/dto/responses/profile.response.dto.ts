import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProfileResponse {
  @ApiProperty({ description: 'UUID único del perfil', example: '550e8400-e29b-41d4-a716-446655440000' })
  uuid!: string;

  @ApiPropertyOptional({ description: 'Nombre del usuario', nullable: true })
  name!: string | null;

  @ApiPropertyOptional({ description: 'Apellidos del usuario', nullable: true })
  lastname!: string | null;

  @ApiPropertyOptional({ description: 'URL del avatar', nullable: true })
  avatarUrl!: string | null;

  @ApiPropertyOptional({ description: 'Biografía del usuario', nullable: true })
  bio!: string | null;

  @ApiProperty({ description: 'Puntos totales acumulados', example: 0 })
  totalPoints!: number;

  @ApiProperty({ description: 'Nivel del usuario', example: 1 })
  level!: number;

  @ApiProperty({
    description: 'Fecha de creación en ISO 8601',
    example: '2025-11-04T23:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Fecha de última actualización en ISO 8601',
    example: '2025-11-04T23:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  updatedAt!: Date;
}
