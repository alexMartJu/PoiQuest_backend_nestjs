import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn,
  UpdateDateColumn, BeforeInsert, Index, OneToMany
} from 'typeorm';
import { randomUUID } from 'crypto';
import { ProfileEntity } from '../profile/domain/entities/profile.entity';
import { EventEntity } from '../events/domain/entities/event.entity';
import { TimeSlotEntity } from './time-slot.entity';
import { PaymentEntity } from './payment.entity';

export enum TicketStatus {
  PENDING_PAYMENT = 'pending_payment',
  ACTIVE = 'active',
  USED = 'used',
  EXPIRED = 'expired',
}

@Entity({ name: 'ticket' })
@Index('idx_ticket_profile', ['profileId'])
@Index('idx_ticket_event', ['eventId'])
@Index('idx_ticket_time_slot', ['timeSlotId'])
export class TicketEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'char', length: 36, unique: true })
  uuid!: string;

  @BeforeInsert()
  setUuid() {
    if (!this.uuid) this.uuid = randomUUID();
  }

  @Column({ name: 'profile_id', type: 'int' })
  profileId!: number;

  @ManyToOne(() => ProfileEntity, (p) => p.tickets, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'profile_id' })
  profile!: ProfileEntity;

  @Column({ name: 'event_id', type: 'int' })
  eventId!: number;

  @ManyToOne(() => EventEntity, (e) => e.tickets, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'event_id' })
  event!: EventEntity;

  @Column({ name: 'time_slot_id', type: 'int', nullable: true })
  timeSlotId?: number | null;

  @ManyToOne(() => TimeSlotEntity, (ts) => ts.tickets, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'time_slot_id' })
  timeSlot?: TimeSlotEntity | null;

  @Column({ name: 'qr_code', type: 'varchar', length: 255, unique: true })
  qrCode!: string;

  @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.PENDING_PAYMENT })
  status!: TicketStatus;

  @Column({ name: 'visit_date', type: 'date', nullable: true })
  visitDate?: string | null;

  @CreateDateColumn({ name: 'purchase_date' })
  purchaseDate!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => PaymentEntity, (p) => p.ticket)
  payments!: PaymentEntity[];
}
