import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index, OneToMany
} from 'typeorm';
import { EventEntity } from './event.entity';
import { TicketEntity } from './ticket.entity';

@Entity({ name: 'time_slot' })
@Index('idx_timeslot_event_date', ['eventId', 'date'])
export class TimeSlotEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'event_id', type: 'int' })
  eventId!: number;

  @ManyToOne(() => EventEntity, (e) => e.timeSlots, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event!: EventEntity;

  @Column({ type: 'date' })
  date!: string;

  @Column({ name: 'start_time', type: 'time' })
  startTime!: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime!: string;

  @Column({ name: 'capacity_limit', type: 'int' })
  capacityLimit!: number;

  @Column({ type: 'int', default: 0 })
  sold!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @OneToMany(() => TicketEntity, (t) => t.timeSlot)
  tickets!: TicketEntity[];
}
