import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index,
} from 'typeorm';
import { ProfileEntity } from '../../../profile/domain/entities/profile.entity';
import { PointOfInterestEntity } from '../../../events/domain/entities/point-of-interest.entity';
import { TicketEntity } from '../../../payments/domain/entities/ticket.entity';

@Entity({ name: 'scan' })
@Index('idx_scan_profile', ['profileId'])
@Index('idx_scan_poi', ['poiId'])
@Index('idx_scan_ticket', ['ticketId'])
@Index('uq_scan_ticket_poi', ['ticketId', 'poiId'], { unique: true })
export class ScanEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'profile_id', type: 'int' })
  profileId!: number;

  @ManyToOne(() => ProfileEntity, (p) => p.scans, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profile_id' })
  profile!: ProfileEntity;

  @Column({ name: 'poi_id', type: 'int' })
  poiId!: number;

  @ManyToOne(() => PointOfInterestEntity, (poi) => poi.scans, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'poi_id' })
  poi!: PointOfInterestEntity;

  @Column({ name: 'ticket_id', type: 'int' })
  ticketId!: number;

  @ManyToOne(() => TicketEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticket_id' })
  ticket!: TicketEntity;

  @CreateDateColumn({ name: 'scanned_at' })
  scannedAt!: Date;
}
