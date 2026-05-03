import { NotificationType } from '../../domain/enums/notification-type.enum';

export interface CreateNotificationDto {
  userId: number;
  title: string;
  message: string;
  notificationType: NotificationType;
}
