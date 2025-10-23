import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index
} from 'typeorm';
import { EventEntity } from './event.entity';

@Entity({ name: 'route' })
@Index('idx_route_event', ['eventId'])
export class RouteEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'event_id', type: 'int' })
  eventId!: number;

  @ManyToOne(() => EventEntity, (e) => e.routes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event!: EventEntity;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'json', nullable: true })
  pois?: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
