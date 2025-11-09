import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsOptional, Matches } from 'class-validator';

export class RegisterStandardUserRequest {
  @ApiProperty({ maxLength: 100, description: 'Nombre del usuario' })
  @IsString({ message: 'El nombre debe ser texto' })
  @MaxLength(100, { message: 'El nombre no puede superar los 100 caracteres' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name!: string;

  @ApiProperty({ maxLength: 150, description: 'Apellidos del usuario' })
  @IsString({ message: 'Los apellidos deben ser texto' })
  @MaxLength(150, { message: 'Los apellidos no pueden exceder 150 caracteres' })
  @IsNotEmpty({ message: 'Los apellidos son obligatorios' })
  lastname!: string;

  @ApiProperty({ format: 'email', maxLength: 255, description: 'Email del usuario' })
  @IsEmail({}, { message: 'Correo electrónico no válido' })
  @MaxLength(255, { message: 'El correo no puede superar los 255 caracteres' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  email!: string;

  @ApiProperty({ minLength: 12, description: 'Contraseña' })
  @IsString({ message: 'La contraseña debe ser texto' })
  @MinLength(12, { message: 'La contraseña debe tener al menos 12 caracteres' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{12,}$/, {
    message: 'La contraseña debe tener al menos 12 caracteres e incluir minúscula, mayúscula y un número',
  })
  password!: string;

  @ApiPropertyOptional({ maxLength: 255, description: 'URL del avatar del usuario' })
  @IsString({ message: 'La URL del avatar debe ser texto' })
  @MaxLength(255, { message: 'La URL del avatar no puede superar los 255 caracteres' })
  @IsOptional()
  avatarUrl?: string;

  @ApiPropertyOptional({ description: 'Biografía del usuario' })
  @IsString({ message: 'La biografía debe ser texto' })
  @IsOptional()
  bio?: string;

}
