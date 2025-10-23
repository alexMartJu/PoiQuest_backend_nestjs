import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index
} from 'typeorm';
import { TicketEntity } from './ticket.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
}

@Entity({ name: 'payment' })
@Index('idx_payment_ticket', ['ticketId'])
export class PaymentEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'ticket_id', type: 'int' })
  ticketId!: number;

  @ManyToOne(() => TicketEntity, (t) => t.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticket_id' })
  ticket!: TicketEntity;

  @Column({ type: 'varchar', length: 50 })
  method!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status!: PaymentStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
