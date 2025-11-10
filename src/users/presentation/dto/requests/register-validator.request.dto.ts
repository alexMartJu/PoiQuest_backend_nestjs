import { IsString, IsEmail, MinLength, MaxLength, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterValidatorRequest {
  @ApiProperty({ maxLength: 100, description: 'Nombre del validador' })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ maxLength: 150, description: 'Apellidos del validador' })
  @IsString()
  @MaxLength(150)
  lastname!: string;

  @ApiProperty({ description: 'Email del validador', example: 'validator@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 8, description: 'Contraseña (mínimo 8 caracteres)' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional({ 
    maxLength: 255, 
    description: 'URL del avatar',
    example: 'https://example.com/avatar.jpg'
  })
  @IsString()
  @IsUrl()
  @MaxLength(255)
  @IsOptional()
  avatarUrl?: string;

  @ApiPropertyOptional({ description: 'Biografía del validador' })
  @IsString()
  @IsOptional()
  bio?: string;
}
