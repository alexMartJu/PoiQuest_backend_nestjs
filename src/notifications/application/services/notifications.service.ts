import { Injectable } from '@nestjs/common';
import { NotificationsRepository } from '../../domain/repositories/notifications.repository';
import { NotificationEntity } from '../../domain/entities/notification.entity';
import { NotFoundError } from '../../../shared/errors/not-found.error';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { NotificationsPage } from '../../domain/types/notifications-page';

@Injectable()
export class NotificationsService {
  constructor(private readonly notificationsRepository: NotificationsRepository) {}

  async getNotifications(
    userId: number,
    cursor?: number,
    limit = 20,
  ): Promise<NotificationsPage> {
    return this.notificationsRepository.findByUserId(userId, cursor, limit);
  }

  async getUnreadCount(userId: number): Promise<number> {
    return this.notificationsRepository.countUnread(userId);
  }

  async markAsRead(id: number, userId: number): Promise<NotificationEntity> {
    const notification = await this.notificationsRepository.markAsRead(id, userId);
    if (!notification) {
      throw new NotFoundError(`Notificación con id ${id} no encontrada`);
    }
    return notification;
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationsRepository.markAllAsRead(userId);
  }

  async createNotification(dto: CreateNotificationDto): Promise<NotificationEntity> {
    const entity = this.notificationsRepository.create({
      userId: dto.userId,
      title: dto.title,
      message: dto.message,
      notificationType: dto.notificationType,
      isRead: false,
    });
    return this.notificationsRepository.save(entity);
  }
}
