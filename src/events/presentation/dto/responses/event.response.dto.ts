import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventStatus } from '../../../domain/enums/event-status.enum';
import { EventCategoryResponse } from './event-category.response.dto';
import { PointOfInterestResponse } from './point-of-interest.response.dto';
import { ImageResponse } from '../../../../media/presentation/dto/image.response.dto';
import { CityResponse } from '../../../../partners/presentation/dto/responses/city.response.dto';
import { OrganizerResponse } from '../../../../partners/presentation/dto/responses/organizer.response.dto';
import { SponsorResponse } from '../../../../partners/presentation/dto/responses/sponsor.response.dto';
import { RouteSummaryResponse } from './route-summary.response.dto';

export class EventResponse {
  @ApiProperty({ description: 'UUID único del evento', example: '550e8400-e29b-41d4-a716-446655440000' })
  uuid!: string;

  @ApiProperty({ description: 'Nombre del evento' })
  name!: string;

  @ApiPropertyOptional({ description: 'Descripción del evento', nullable: true })
  description!: string | null;

  @ApiPropertyOptional({ type: EventCategoryResponse, description: 'Categoría del evento', nullable: true })
  category!: EventCategoryResponse | null;

  @ApiProperty({ enum: EventStatus, description: 'Estado del evento (active/finished)' })
  status!: EventStatus;

  @ApiPropertyOptional({ type: CityResponse, description: 'Ciudad donde se celebra el evento', nullable: true })
  city!: CityResponse | null;

  @ApiPropertyOptional({ type: OrganizerResponse, description: 'Organizador del evento', nullable: true })
  organizer!: OrganizerResponse | null;

  @ApiPropertyOptional({ type: SponsorResponse, description: 'Patrocinador del evento', nullable: true })
  sponsor!: SponsorResponse | null;

  @ApiProperty({ description: 'Indica si el evento es premium (requiere pago)', example: false })
  isPremium!: boolean;

  @ApiPropertyOptional({ description: 'Precio del evento en EUR (solo si isPremium = true)', nullable: true, type: Number, example: null })
  price!: number | null;

  @ApiPropertyOptional({ description: 'Capacidad máxima de personas por día. null = sin límite.', nullable: true, type: Number, example: null })
  capacityPerDay!: number | null;

  @ApiProperty({ description: 'Fecha de inicio (YYYY-MM-DD)', example: '2025-12-01' })
  startDate!: string;

  @ApiPropertyOptional({ 
    description: 'Fecha de fin (YYYY-MM-DD)', 
    example: '2025-12-31',
    nullable: true 
  })
  endDate!: string | null;

  @ApiPropertyOptional({ 
    type: [PointOfInterestResponse], 
    description: 'Lista de puntos de interés asociados al evento',
    nullable: true
  })
  pointsOfInterest?: Omit<PointOfInterestResponse, 'event'>[] | null;

  @ApiPropertyOptional({
    type: [RouteSummaryResponse],
    description: 'Rutas del evento (uuid y nombre)',
    nullable: true,
  })
  routes?: RouteSummaryResponse[] | null;

  @ApiProperty({ type: [ImageResponse], description: 'Imágenes del evento' })
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

  @ApiPropertyOptional({ 
    description: 'Fecha de eliminación en ISO 8601. Null si el evento no ha sido eliminado.',
    example: null,
    nullable: true,
    type: String,
    format: 'date-time',
  })
  deletedAt!: Date | null;
}
