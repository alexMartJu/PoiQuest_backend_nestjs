import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn,
  UpdateDateColumn, DeleteDateColumn, BeforeInsert, OneToMany, Index
} from 'typeorm';
import { randomUUID } from 'crypto';
import { EventEntity } from './event.entity';
import { ScanEntity } from '../../../entities/scan.entity';

@Entity({ name: 'point_of_interest' })
@Index('uq_poi_uuid', ['uuid'], { unique: true })
@Index('idx_poi_event', ['eventId'])
@Index('uq_poi_qr_code', ['qrCode'], { unique: true })
export class PointOfInterestEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'char', length: 36, unique: true })
  uuid!: string;

  @Column({ name: 'event_id', type: 'int' })
  eventId!: number;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  author?: string | null;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ name: 'interesting_data', type: 'text', nullable: true })
  interestingData?: string | null;

  @Column({ name: 'model_file_name', type: 'varchar', length: 500, nullable: true })
  modelFileName?: string | null;

  @Column({ name: 'qr_code', type: 'varchar', length: 255, unique: true })
  qrCode!: string;

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
  @ManyToOne(() => EventEntity, (e) => e.pointsOfInterest, { nullable: false })
  @JoinColumn({ name: 'event_id' })
  event!: EventEntity;

  @OneToMany(() => ScanEntity, (s) => s.poi)
  scans!: ScanEntity[];

  // --- Hooks ---
  @BeforeInsert()
  generateIdentifiers() {
    if (!this.uuid) {
      this.uuid = randomUUID();
    }
    // El QR se genera automáticamente como deep link al POI
    if (!this.qrCode) {
      this.qrCode = `poiquest://poi/${this.uuid}`;
    }
  }
}
