import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenRequest {
  @ApiProperty({ description: 'Refresh token para obtener un nuevo access token' })
  @IsString({ message: 'El refresh token debe ser una cadena' })
  @IsNotEmpty({ message: 'El refresh token es obligatorio' })
  refreshToken!: string;
}
