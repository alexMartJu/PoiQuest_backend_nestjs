import {
  Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn,
  UpdateDateColumn, DeleteDateColumn, Unique, Index
} from 'typeorm';
import { PointOfInterestEntity } from './point-of-interest.entity';
import { TimeSlotEntity } from './time-slot.entity';
import { TicketEntity } from './ticket.entity';
import { RouteEntity } from './route.entity';

export enum EventType {
  MUSEUM = 'museum',
  CONCERT = 'concert',
  THEATER = 'theater',
  TOUR = 'tour',
  OTHER = 'other',
}

@Entity({ name: 'event' })
@Unique('uq_event_slug', ['slug'])
@Index('idx_event_name', ['name'])
export class EventEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'enum', enum: EventType })
  type!: EventType;

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
}
