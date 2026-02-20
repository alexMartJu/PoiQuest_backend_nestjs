import { ApiProperty } from '@nestjs/swagger';

export class CategoryEventCountItem {
  @ApiProperty({ description: 'UUID de la categoría', example: '550e8400-e29b-41d4-a716-446655440000' })
  categoryUuid!: string;

  @ApiProperty({ description: 'Nombre de la categoría' })
  categoryName!: string;

  @ApiProperty({ description: 'Número de eventos en esta categoría' })
  eventCount!: number;
}

export class EventsByCategoryResponse {
  @ApiProperty({ 
    type: [CategoryEventCountItem], 
    description: 'Lista de categorías con su conteo de eventos' 
  })
  data!: CategoryEventCountItem[];
}
