import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
  CreateDateColumn, UpdateDateColumn, Index
} from 'typeorm';
import { UserEntity } from './user.entity';

export enum IncidentType {
  PAYMENT = 'payment',
  TICKET = 'ticket',
  ACCESS = 'access',
  TECHNICAL = 'technical',
  OTHER = 'other',
}

export enum IncidentStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

@Entity({ name: 'incident' })
@Index('idx_incident_user', ['userId'])
@Index('idx_incident_status', ['status'])
export class IncidentEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id', type: 'int' })
  userId!: number;

  @ManyToOne(() => UserEntity, (u) => u.incidents, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ type: 'enum', enum: IncidentType })
  type!: IncidentType;

  @Column({ type: 'text' })
  description!: string;

  @Column({ name: 'payment_method', type: 'varchar', length: 50, nullable: true })
  paymentMethod?: string | null;

  @Column({ name: 'external_reference', type: 'varchar', length: 100, nullable: true })
  externalReference?: string | null;

  @Column({ type: 'enum', enum: IncidentStatus, default: IncidentStatus.OPEN })
  status!: IncidentStatus;

  @CreateDateColumn({ name: 'incident_date' })
  incidentDate!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
