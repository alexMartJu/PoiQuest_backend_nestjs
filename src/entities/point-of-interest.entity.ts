import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn,
  UpdateDateColumn, DeleteDateColumn, BeforeInsert, OneToMany, Index
} from 'typeorm';
import { randomUUID } from 'crypto';
import { EventEntity } from '../events/domain/entities/event.entity';
import { ScanEntity } from './scan.entity';

@Entity({ name: 'point_of_interest' })
@Index('idx_poi_event', ['eventId'])
export class PointOfInterestEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'char', length: 36, unique: true })
  uuid!: string;

  @BeforeInsert()
  setUuid() {
    if (!this.uuid) this.uuid = randomUUID();
  }

  @Column({ name: 'event_id', type: 'int' })
  eventId!: number;

  @ManyToOne(() => EventEntity, (e) => e.pointsOfInterest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event!: EventEntity;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  author?: string | null;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'json', nullable: true })
  multimedia?: Record<string, any> | null;

  @Column({ name: 'qr_code', type: 'varchar', length: 255, unique: true })
  qrCode!: string;

  @Column({ name: 'nfc_tag', type: 'varchar', length: 255, nullable: true, unique: true })
  nfcTag?: string | null;

  @Column({ name: 'coord_x', type: 'float', nullable: true })
  coordX?: number | null;

  @Column({ name: 'coord_y', type: 'float', nullable: true })
  coordY?: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date | null;

  // --- Relations ---
  @OneToMany(() => ScanEntity, (s) => s.poi)
  scans!: ScanEntity[];
}
