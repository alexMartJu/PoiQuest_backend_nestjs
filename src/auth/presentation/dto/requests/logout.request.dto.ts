import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogoutRequestDto {
  @ApiProperty({ description: 'Refresh token a invalidar', type: 'string' })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
