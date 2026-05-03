import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, QueryFailedError, Repository } from 'typeorm';
import { NotificationsRepository } from '../../../domain/repositories/notifications.repository';
import { NotificationEntity } from '../../../domain/entities/notification.entity';
import { NotificationsPage } from '../../../domain/types/notifications-page';
import { ConflictError } from '../../../../shared/errors/conflict.error';

@Injectable()
export class TypeormNotificationsRepository implements NotificationsRepository {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly repo: Repository<NotificationEntity>,
  ) {}

  async findByUserId(
    userId: number,
    cursor: number | undefined,
    limit: number,
  ): Promise<NotificationsPage> {
    const qb = this.repo
      .createQueryBuilder('n')
      .where('n.user_id = :userId', { userId })
      .andWhere('n.deleted_at IS NULL')
      .orderBy('n.id', 'DESC')
      .take(limit + 1);

    if (cursor !== undefined) {
      qb.andWhere('n.id < :cursor', { cursor });
    }

    const rows = await qb.getMany();
    const hasMore = rows.length > limit;
    if (hasMore) rows.pop();

    return {
      data: rows,
      nextCursor: hasMore ? rows[rows.length - 1].id : null,
    };
  }

  async countUnread(userId: number): Promise<number> {
    return this.repo.count({
      where: { userId, isRead: false, deletedAt: IsNull() },
    });
  }

  async markAsRead(id: number, userId: number): Promise<NotificationEntity | null> {
    const notification = await this.repo.findOne({ where: { id, userId, deletedAt: IsNull() } });
    if (!notification) return null;
    notification.isRead = true;
    return this.repo.save(notification);
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .update(NotificationEntity)
      .set({ isRead: true })
      .where('user_id = :userId', { userId })
      .andWhere('is_read = :isRead', { isRead: false })
      .execute();
  }

  create(data: Partial<NotificationEntity>): NotificationEntity {
    return this.repo.create(data);
  }

  async save(entity: NotificationEntity): Promise<NotificationEntity> {
    try {
      return await this.repo.save(entity);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        const driverErr = (err as any).driverError;
        if (driverErr?.code === 'ER_DUP_ENTRY' || driverErr?.errno === 1062 || driverErr?.code === '23505') {
          throw new ConflictError('Valor duplicado en la base de datos', {});
        }
      }
      throw err;
    }
  }
}
