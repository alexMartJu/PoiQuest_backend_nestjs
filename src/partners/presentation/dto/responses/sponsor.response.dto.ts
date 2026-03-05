import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartnerStatus } from '../../../domain/enums/partner-status.enum';
import { ImageResponse } from '../../../../media/presentation/dto/image.response.dto';

export class SponsorResponse {
  @ApiProperty({ description: 'UUID único del patrocinador', example: '550e8400-e29b-41d4-a716-446655440000' })
  uuid!: string;

  @ApiProperty({ description: 'Nombre del patrocinador' })
  name!: string;

  @ApiPropertyOptional({ description: 'URL de la web del patrocinador', nullable: true, example: 'https://sponsor.com' })
  websiteUrl!: string | null;

  @ApiPropertyOptional({ description: 'Email de contacto', nullable: true, example: 'info@sponsor.com' })
  contactEmail!: string | null;

  @ApiPropertyOptional({ description: 'Descripción del patrocinador', nullable: true })
  description!: string | null;

  @ApiProperty({ enum: PartnerStatus, description: 'Estado del patrocinador (active/disabled)' })
  status!: PartnerStatus;

  @ApiProperty({ type: [ImageResponse], description: 'Imágenes del patrocinador' })
  images!: ImageResponse[];

  @ApiProperty({
    description: 'Fecha de creación en ISO 8601',
    example: '2025-11-04T23:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Fecha de última actualización en ISO 8601',
    example: '2025-11-04T23:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  updatedAt!: Date;
}
