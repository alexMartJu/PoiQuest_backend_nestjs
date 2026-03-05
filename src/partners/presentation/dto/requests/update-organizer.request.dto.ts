import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsEmail, MaxLength, IsOptional,
  IsEnum, IsArray, ArrayMaxSize,
} from 'class-validator';
import { OrganizerType } from '../../../domain/enums/organizer-type.enum';

export class UpdateOrganizerRequest {
  @ApiPropertyOptional({ maxLength: 200, description: 'Nombre del organizador' })
  @IsString()
  @MaxLength(200)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ enum: OrganizerType, description: 'Tipo de organizador' })
  @IsEnum(OrganizerType)
  @IsOptional()
  type?: OrganizerType;

  @ApiPropertyOptional({ description: 'Email de contacto' })
  @IsEmail()
  @MaxLength(255)
  @IsOptional()
  contactEmail?: string;

  @ApiPropertyOptional({ maxLength: 50, description: 'Teléfono de contacto', nullable: true, type: String })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  contactPhone?: string | null;

  @ApiPropertyOptional({ description: 'Descripción del organizador', nullable: true, type: String })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiPropertyOptional({
    type: [String],
    description: 'Nombres de archivos de imagen en MinIO bucket "images". Máximo 2.',
    example: ['organizer1.jpg'],
  })
  @IsArray()
  @ArrayMaxSize(2)
  @IsString({ each: true })
  @IsOptional()
  imageFileNames?: string[];
}
