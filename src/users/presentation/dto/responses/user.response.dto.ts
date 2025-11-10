import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from '../../../domain/enums/user-status.enum';
import { ProfileSummaryResponse } from '../../../../profile/presentation/dto/responses/profile-summary.response.dto';

export class RoleResponse {
  @ApiProperty({ description: 'ID del rol' })
  id!: number;

  @ApiProperty({ description: 'Nombre del rol', example: 'user' })
  name!: string;
}

export class UserResponse {
  @ApiProperty({ description: 'ID del usuario' })
  id!: number;

  @ApiProperty({ description: 'Email del usuario' })
  email!: string;

  @ApiProperty({ enum: UserStatus, description: 'Estado del usuario (active/disabled)' })
  status!: UserStatus;

  @ApiProperty({ type: [RoleResponse], description: 'Roles del usuario' })
  roles!: RoleResponse[];

  @ApiPropertyOptional({ type: ProfileSummaryResponse, description: 'Perfil del usuario', nullable: true })
  profile!: ProfileSummaryResponse | null;

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
