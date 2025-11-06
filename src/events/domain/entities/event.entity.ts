import {
  Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn,
  UpdateDateColumn, DeleteDateColumn, Index, BeforeInsert
} from 'typeorm';
import { randomUUID } from 'crypto';
import { PointOfInterestEntity } from '../../../entities/point-of-interest.entity';
import { TimeSlotEntity } from '../../../entities/time-slot.entity';
import { TicketEntity } from '../../../entities/ticket.entity';
import { RouteEntity } from '../../../entities/route.entity';
import { EventType } from '../enums/event-type.enum';
import { EventStatus } from '../enums/event-status.enum';

@Entity({ name: 'event' })
@Index('uq_event_uuid', ['uuid'], { unique: true })
@Index('idx_event_name', ['name'])
export class EventEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'char', length: 36, unique: true })
  uuid!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'enum', enum: EventType })
  type!: EventType;

  @Column({ type: 'enum', enum: EventStatus, default: EventStatus.ACTIVE })
  status!: EventStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location?: string | null;

  @Column({ name: 'start_date', type: 'date' })
  startDate!: string;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date | null;

  // --- Relations ---
  @OneToMany(() => PointOfInterestEntity, (poi) => poi.event)
  pointsOfInterest!: PointOfInterestEntity[];

  @OneToMany(() => TimeSlotEntity, (ts) => ts.event)
  timeSlots!: TimeSlotEntity[];

  @OneToMany(() => TicketEntity, (t) => t.event)
  tickets!: TicketEntity[];

  @OneToMany(() => RouteEntity, (r) => r.event)
  routes!: RouteEntity[];

  // Genera el uuid automáticamente antes de insertar
  @BeforeInsert()
  generateUuid() {
    if (!this.uuid) {
      this.uuid = randomUUID();
    }
  }
}
