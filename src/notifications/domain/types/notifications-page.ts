import { NotificationEntity } from '../entities/notification.entity';

export interface NotificationsPage {
  data: NotificationEntity[];
  nextCursor: number | null;
}
