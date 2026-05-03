import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationResponse } from './notification.response.dto';

export class PaginatedNotificationsResponse {
  @ApiProperty({ type: [NotificationResponse], description: 'Lista de notificaciones de la página actual' })
  data!: NotificationResponse[];

  @ApiPropertyOptional({ example: 42, nullable: true, description: 'Cursor para la siguiente página (null si no hay más)' })
  nextCursor!: number | null;
}
