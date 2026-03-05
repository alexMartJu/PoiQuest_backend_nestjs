import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizerResponse } from './organizer.response.dto';

export class PaginatedOrganizersResponse {
  @ApiProperty({ type: [OrganizerResponse], description: 'Lista de organizadores de la página actual' })
  data!: OrganizerResponse[];

  @ApiPropertyOptional({
    description: 'Cursor para obtener la siguiente página (valor ISO 8601). Null si no hay más páginas.',
    nullable: true,
    type: String,
    example: '2025-03-09T12:34:56.000Z',
  })
  nextCursor!: string | null;

  @ApiProperty({ description: 'Indica si existe una página siguiente', example: false })
  hasNextPage!: boolean;
}
