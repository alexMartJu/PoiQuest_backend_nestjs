import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventResponse } from './event.response.dto';

export class PaginatedEventsResponse {
  @ApiProperty({ 
    type: [EventResponse], 
    description: 'Lista de eventos de la página actual'
  })
  data!: EventResponse[];

  @ApiPropertyOptional({ 
    description: 'Cursor para la siguiente página (createdAt del último evento en formato ISO 8601). Null si no hay más páginas.',
    example: '2025-03-09T12:34:56.000Z',
    nullable: true
  })
  nextCursor!: string | null;

  @ApiProperty({ 
    description: 'Indica si hay una página siguiente',
    example: true
  })
  hasNextPage!: boolean;
}
