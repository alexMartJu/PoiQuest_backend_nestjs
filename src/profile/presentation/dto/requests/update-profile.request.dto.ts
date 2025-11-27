import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileRequest {
  @ApiPropertyOptional({ maxLength: 100, description: 'Nombre del usuario' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ maxLength: 150, description: 'Apellidos del usuario' })
  @IsString()
  @MaxLength(150)
  @IsOptional()
  lastname?: string;

  @ApiPropertyOptional({ description: 'Biografía del usuario', nullable: true, example: null, type: String })
  @IsString()
  @IsOptional()
  bio?: string | null;
}
