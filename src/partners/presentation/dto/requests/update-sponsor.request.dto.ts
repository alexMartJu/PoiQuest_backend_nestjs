import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsEmail, MaxLength, IsOptional,
  IsUrl, IsArray, ArrayMaxSize,
} from 'class-validator';

export class UpdateSponsorRequest {
  @ApiPropertyOptional({ maxLength: 200, description: 'Nombre del patrocinador' })
  @IsString()
  @MaxLength(200)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ maxLength: 500, description: 'URL del sitio web', nullable: true, type: String })
  @IsUrl()
  @MaxLength(500)
  @IsOptional()
  websiteUrl?: string | null;

  @ApiPropertyOptional({ description: 'Email de contacto', nullable: true, type: String })
  @IsEmail()
  @MaxLength(255)
  @IsOptional()
  contactEmail?: string | null;

  @ApiPropertyOptional({ description: 'Descripción del patrocinador', nullable: true, type: String })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiPropertyOptional({
    type: [String],
    description: 'Nombres de archivos de imagen en MinIO bucket "images". Máximo 2.',
    example: ['sponsor1.jpg'],
  })
  @IsArray()
  @ArrayMaxSize(2)
  @IsString({ each: true })
  @IsOptional()
  imageFileNames?: string[];
}
