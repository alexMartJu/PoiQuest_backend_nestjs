import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartnerStatus } from '../../../domain/enums/partner-status.enum';

export class CityResponse {
  @ApiProperty({ description: 'UUID único de la ciudad', example: '550e8400-e29b-41d4-a716-446655440000' })
  uuid!: string;

  @ApiProperty({ description: 'Nombre de la ciudad', example: 'Madrid' })
  name!: string;

  @ApiProperty({ description: 'País', example: 'España' })
  country!: string;

  @ApiPropertyOptional({ description: 'Región o comunidad autónoma', nullable: true, example: 'Comunidad de Madrid' })
  region!: string | null;

  @ApiPropertyOptional({ description: 'Descripción de la ciudad', nullable: true })
  description!: string | null;

  @ApiProperty({ enum: PartnerStatus, description: 'Estado de la ciudad (active/disabled)' })
  status!: PartnerStatus;

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
