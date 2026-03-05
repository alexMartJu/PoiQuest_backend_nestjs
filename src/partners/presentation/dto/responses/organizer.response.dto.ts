import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartnerStatus } from '../../../domain/enums/partner-status.enum';
import { ImageResponse } from '../../../../media/presentation/dto/image.response.dto';

export class OrganizerResponse {
  @ApiProperty({ description: 'UUID único del organizador', example: '550e8400-e29b-41d4-a716-446655440000' })
  uuid!: string;

  @ApiProperty({ description: 'Nombre del organizador' })
  name!: string;

  @ApiProperty({
    description: 'Tipo de organizador',
    enum: ['city_council', 'company', 'individual'],
    example: 'company',
  })
  type!: string;

  @ApiProperty({ description: 'Email de contacto', example: 'info@organizer.com' })
  contactEmail!: string;

  @ApiPropertyOptional({ description: 'Teléfono de contacto', nullable: true })
  contactPhone!: string | null;

  @ApiPropertyOptional({ description: 'Descripción del organizador', nullable: true })
  description!: string | null;

  @ApiProperty({ enum: PartnerStatus, description: 'Estado del organizador (active/disabled)' })
  status!: PartnerStatus;

  @ApiProperty({ type: [ImageResponse], description: 'Imágenes del organizador' })
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
