import { ApiProperty } from '@nestjs/swagger';

export class UnreadCountResponse {
  @ApiProperty({ example: 3, description: 'Número de notificaciones no leídas' })
  count!: number;
}
