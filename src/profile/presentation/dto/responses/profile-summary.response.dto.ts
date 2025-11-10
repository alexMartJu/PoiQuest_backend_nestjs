import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProfileSummaryResponse {
  @ApiProperty({ description: 'UUID del perfil' })
  uuid!: string;

  @ApiPropertyOptional({ description: 'Nombre', nullable: true })
  name!: string | null;

  @ApiPropertyOptional({ description: 'Apellidos', nullable: true })
  lastname!: string | null;

  @ApiPropertyOptional({ description: 'URL del avatar', nullable: true })
  avatarUrl!: string | null;

  @ApiProperty({ description: 'Nivel del usuario', example: 1 })
  level!: number;

  @ApiProperty({ description: 'Puntos totales', example: 0 })
  totalPoints!: number;
}
