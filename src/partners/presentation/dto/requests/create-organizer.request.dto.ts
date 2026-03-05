import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsNotEmpty, IsEmail, MaxLength, IsOptional,
  IsEnum, IsArray, ArrayMinSize, ArrayMaxSize,
} from 'class-validator';
import { OrganizerType } from '../../../domain/enums/organizer-type.enum';

export class CreateOrganizerRequest {
  @ApiProperty({ maxLength: 200, description: 'Nombre del organizador', example: 'Ayuntamiento de Madrid' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiProperty({
    enum: OrganizerType,
    description: 'Tipo de organizador',
    example: OrganizerType.CITY_COUNCIL,
  })
  @IsEnum(OrganizerType)
  type!: OrganizerType;

  @ApiProperty({ description: 'Email de contacto', example: 'contacto@organizer.com' })
  @IsEmail()
  @MaxLength(255)
  contactEmail!: string;

  @ApiPropertyOptional({ maxLength: 50, description: 'Teléfono de contacto', nullable: true, type: String, example: '+34 910 000 000' })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  contactPhone?: string | null;

  @ApiPropertyOptional({ description: 'Descripción del organizador', nullable: true, type: String, example: null })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiProperty({
    type: [String],
    description: 'Nombres de archivos de imagen en MinIO bucket "images". Mínimo 1, máximo 2.',
    example: ['organizer1.jpg'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(2)
  @IsString({ each: true })
  imageFileNames!: string[];
}
