import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
  CreateDateColumn, BeforeInsert, Index,
} from 'typeorm';
import { randomUUID } from 'crypto';
import { TicketEntity } from '../../../payments/domain/entities/ticket.entity';
import { UserEntity } from '../../../users/domain/entities/user.entity';

@Entity({ name: 'ticket_validation' })
@Index('idx_ticket_validation_ticket', ['ticketId'])
@Index('idx_ticket_validation_validator', ['validatorId'])
export class TicketValidationEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'char', length: 36, unique: true })
  uuid!: string;

  @BeforeInsert()
  setUuid() {
    if (!this.uuid) this.uuid = randomUUID();
  }

  @Column({ name: 'ticket_id', type: 'int' })
  ticketId!: number;

  @ManyToOne(() => TicketEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'ticket_id' })
  ticket!: TicketEntity;

  @Column({ name: 'validator_id', type: 'int' })
  validatorId!: number;

  @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'validator_id' })
  validator!: UserEntity;

  @Column({ type: 'boolean', default: true })
  valid!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reason?: string | null;

  @CreateDateColumn({ name: 'validated_at' })
  validatedAt!: Date;
}
