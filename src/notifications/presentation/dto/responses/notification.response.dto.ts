import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '../../../domain/enums/notification-type.enum';

export class NotificationResponse {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Recordatorio de evento' })
  title!: string;

  @ApiProperty({ example: 'Tu evento "Festival de Jazz" comienza mañana a las 18:00.' })
  message!: string;

  @ApiProperty({ enum: NotificationType, example: NotificationType.EVENT })
  notificationType!: NotificationType;

  @ApiProperty({ example: false })
  isRead!: boolean;

  @ApiProperty({ example: '2025-06-01T08:00:00.000Z' })
  createdAt!: Date;
}
