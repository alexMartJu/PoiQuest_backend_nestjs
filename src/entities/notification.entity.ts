import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, DeleteDateColumn, Index
} from 'typeorm';
import { UserEntity } from '../users/domain/entities/user.entity';

export enum NotificationType {
  SYSTEM = 'system',
  PAYMENT = 'payment',
  TICKET = 'ticket',
  ACHIEVEMENT = 'achievement',
  EVENT = 'event',
  CUSTOM = 'custom',
}

@Entity({ name: 'notification' })
@Index('idx_notification_user', ['userId'])
@Index('idx_notification_user_read', ['userId', 'isRead'])
export class NotificationEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id', type: 'int' })
  userId!: number;

  @ManyToOne(() => UserEntity, (u) => u.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ type: 'text' })
  message!: string;

  @Column({ name: 'notification_type', type: 'enum', enum: NotificationType })
  notificationType!: NotificationType;

  @Column({ name: 'is_read', type: 'tinyint', width: 1, default: 0 })
  isRead!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date | null;
}
