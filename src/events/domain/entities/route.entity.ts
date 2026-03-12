import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
  CreateDateColumn, UpdateDateColumn, DeleteDateColumn, BeforeInsert, OneToMany, Index,
} from 'typeorm';
import { randomUUID } from 'crypto';
import { EventEntity } from './event.entity';
import { RoutePoiEntity } from './route-poi.entity';

@Entity({ name: 'route' })
@Index('uq_route_uuid', ['uuid'], { unique: true })
@Index('idx_route_event', ['eventId'])
export class RouteEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'char', length: 36, unique: true })
  uuid!: string;

  @Column({ name: 'event_id', type: 'int' })
  eventId!: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date | null;

  // --- Relations ---
  @ManyToOne(() => EventEntity, (e) => e.routes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event!: EventEntity;

  @OneToMany(() => RoutePoiEntity, (rp) => rp.route, { cascade: ['insert', 'update'] })
  routePois!: RoutePoiEntity[];

  // --- Hooks ---
  @BeforeInsert()
  setUuid() {
    if (!this.uuid) {
      this.uuid = randomUUID();
    }
  }
}
