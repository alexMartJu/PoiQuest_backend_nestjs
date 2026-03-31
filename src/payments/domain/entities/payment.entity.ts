import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index,
} from 'typeorm';
import { TicketEntity } from './ticket.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
}

@Entity({ name: 'payment' })
@Index('idx_payment_ticket', ['ticketId'])
@Index('idx_payment_stripe', ['stripePaymentIntentId'])
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

  @Column({ type: 'varchar', length: 5, default: 'EUR' })
  currency!: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status!: PaymentStatus;

  @Column({ name: 'stripe_payment_intent_id', type: 'varchar', length: 255, nullable: true })
  stripePaymentIntentId?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
