import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsNotEmpty, IsEmail, MaxLength, IsOptional,
  IsUrl, IsArray, ArrayMinSize, ArrayMaxSize,
} from 'class-validator';

export class CreateSponsorRequest {
  @ApiProperty({ maxLength: 200, description: 'Nombre del patrocinador', example: 'Acme Corp' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({ maxLength: 500, description: 'URL del sitio web del patrocinador', nullable: true, type: String, example: 'https://acmecorp.com' })
  @IsUrl()
  @MaxLength(500)
  @IsOptional()
  websiteUrl?: string | null;

  @ApiPropertyOptional({ description: 'Email de contacto del patrocinador', nullable: true, type: String, example: 'sponsor@acmecorp.com' })
  @IsEmail()
  @MaxLength(255)
  @IsOptional()
  contactEmail?: string | null;

  @ApiPropertyOptional({ description: 'Descripción del patrocinador', nullable: true, type: String, example: null })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiProperty({
    type: [String],
    description: 'Nombres de archivos de imagen en MinIO bucket "images". Mínimo 1, máximo 2.',
    example: ['sponsor1.jpg'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(2)
  @IsString({ each: true })
  imageFileNames!: string[];
}
