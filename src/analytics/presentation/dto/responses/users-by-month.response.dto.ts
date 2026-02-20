import { ApiProperty } from '@nestjs/swagger';

export class MonthlyUserCountItem {
  @ApiProperty({ description: 'Año', example: 2025 })
  year!: number;

  @ApiProperty({ description: 'Mes (1-12)', example: 3 })
  month!: number;

  @ApiProperty({ description: 'Número de usuarios registrados en ese mes' })
  userCount!: number;
}

export class UsersByMonthResponse {
  @ApiProperty({ 
    type: [MonthlyUserCountItem], 
    description: 'Lista de meses con su conteo de usuarios registrados' 
  })
  data!: MonthlyUserCountItem[];
}
