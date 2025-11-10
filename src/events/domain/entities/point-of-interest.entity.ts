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
@Index('uq_poi_nfc_tag', ['nfcTag'], { unique: true })
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

  @Column({
    type: 'longtext',
    nullable: true,
    collation: 'utf8mb4_bin',
    transformer: {
      to: (val: Record<string, any> | null) => {
        return val === null || val === undefined ? null : JSON.stringify(val);
      },
      from: (val: string | null) => {
        if (val === null || val === undefined) return null;
        try {
          return JSON.parse(val);
        } catch (e) {
          // Si el contenido no es JSON válido, devolvemos null para evitar excepciones
          return null;
        }
      },
    },
  })
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
  @ManyToOne(() => EventEntity, (e) => e.pointsOfInterest, { nullable: false })
  @JoinColumn({ name: 'event_id' })
  event!: EventEntity;

  @OneToMany(() => ScanEntity, (s) => s.poi)
  scans!: ScanEntity[];

  // --- Hooks ---
  @BeforeInsert()
  setUuid() {
    if (!this.uuid) {
      this.uuid = randomUUID();
    }
  }
}
