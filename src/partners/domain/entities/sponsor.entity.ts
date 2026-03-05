import {
  Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn,
  UpdateDateColumn, DeleteDateColumn, Index, BeforeInsert,
} from 'typeorm';
import { randomUUID } from 'crypto';
import { PartnerStatus } from '../enums/partner-status.enum';

// Importación diferida para evitar deps circulares en tiempo de carga de módulos
// eslint-disable-next-line @typescript-eslint/no-require-imports
const getEventEntity = () => require('../../../events/domain/entities/event.entity').EventEntity;

@Entity({ name: 'sponsor' })
@Index('uq_sponsor_uuid', ['uuid'], { unique: true })
@Index('idx_sponsor_status', ['status'])
export class SponsorEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'char', length: 36, unique: true })
  uuid!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ name: 'website_url', type: 'varchar', length: 500, nullable: true })
  websiteUrl?: string | null;

  @Column({ name: 'contact_email', type: 'varchar', length: 255, nullable: true })
  contactEmail?: string | null;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'enum', enum: PartnerStatus, default: PartnerStatus.ACTIVE })
  status!: PartnerStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date | null;

  // Relations
  @OneToMany(getEventEntity, (e: any) => e.sponsor)
  events!: any[];

  @BeforeInsert()
  generateUuid() {
    if (!this.uuid) {
      this.uuid = randomUUID();
    }
  }
}
