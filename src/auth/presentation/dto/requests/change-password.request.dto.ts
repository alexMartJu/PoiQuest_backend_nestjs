import { IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

export class ChangePasswordDto {
  @ApiProperty({ description: 'Contraseña actual', type: 'string' })
  @IsString()
  oldPassword!: string;

  @ApiProperty({ description: 'Nueva contraseña (mín 12, incl. minúsc., mayúsc. y número)', type: 'string' })
  @IsString()
  @MinLength(12, { message: 'La nueva contraseña debe tener al menos 12 caracteres' })
  @Matches(PASSWORD_REGEX, { message: 'La contraseña debe incluir minúsculas, mayúsculas y números' })
  newPassword!: string;
}
