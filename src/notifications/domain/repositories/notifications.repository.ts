import { NotificationEntity } from '../entities/notification.entity';
import { NotificationsPage } from '../types/notifications-page';

export abstract class NotificationsRepository {
  /** Obtiene las notificaciones de un usuario con paginación por cursor */
  abstract findByUserId(
    userId: number,
    cursor: number | undefined,
    limit: number,
  ): Promise<NotificationsPage>;

  /** Cuenta notificaciones no leídas de un usuario */
  abstract countUnread(userId: number): Promise<number>;

  /** Marca una notificación como leída (verifica que pertenece al usuario) */
  abstract markAsRead(id: number, userId: number): Promise<NotificationEntity | null>;

  /** Marca todas las notificaciones de un usuario como leídas */
  abstract markAllAsRead(userId: number): Promise<void>;

  /** Crea una nueva instancia de notificación (sin persistir) */
  abstract create(data: Partial<NotificationEntity>): NotificationEntity;

  /** Persiste la notificación en la base de datos */
  abstract save(entity: NotificationEntity): Promise<NotificationEntity>;
}
