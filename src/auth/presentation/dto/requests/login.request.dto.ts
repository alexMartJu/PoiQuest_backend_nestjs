import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginRequest {
  @ApiProperty({ format: 'email', maxLength: 255, description: 'Email del usuario' })
  @IsEmail({}, { message: 'Correo electrónico no válido' })
  @MaxLength(255, { message: 'El correo no puede tener más de 255 caracteres' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  email!: string;

  @ApiProperty({ minLength: 12, description: 'Contraseña' })
  @IsString({ message: 'La contraseña debe ser texto' })
  @MinLength(12, { message: 'La contraseña debe tener al menos 12 caracteres' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password!: string;
}
