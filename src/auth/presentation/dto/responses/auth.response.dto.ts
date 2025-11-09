import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthResponse {
  @ApiPropertyOptional({ description: 'JWT Access token' })
  accessToken?: string | null;

  @ApiPropertyOptional({ description: 'JWT Refresh token' })
  refreshToken?: string | null;

  @ApiProperty({ description: 'ID del usuario' })
  userId!: number;

  @ApiProperty({ description: 'Nombre del usuario autenticado' })
  name!: string;

  @ApiProperty({ description: 'Apellidos del usuario autenticado' })
  lastname!: string;

  @ApiProperty({ format: 'email', description: 'Email del usuario autenticado' })
  email!: string;

  @ApiPropertyOptional({ nullable: true, description: 'URL del avatar o null' })
  avatarUrl!: string | null;

  @ApiPropertyOptional({ nullable: true, description: 'Biografía del usuario o null' })
  bio!: string | null;

  @ApiProperty({
    description: 'Roles del usuario',
    example: ['user', 'admin', 'ticket_validator'],
    isArray: true,
  })
  roles!: string[];
}
