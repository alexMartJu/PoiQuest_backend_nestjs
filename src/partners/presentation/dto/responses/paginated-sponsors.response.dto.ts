import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SponsorResponse } from './sponsor.response.dto';

export class PaginatedSponsorsResponse {
  @ApiProperty({ type: [SponsorResponse], description: 'Lista de patrocinadores de la página actual' })
  data!: SponsorResponse[];

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
