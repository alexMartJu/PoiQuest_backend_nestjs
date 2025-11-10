import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index
} from 'typeorm';
import { ProfileEntity } from '../profile/domain/entities/profile.entity';
import { PointOfInterestEntity } from '../events/domain/entities/point-of-interest.entity';

@Entity({ name: 'scan' })
@Index('idx_scan_profile', ['profileId'])
@Index('idx_scan_poi', ['poiId'])
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

  @CreateDateColumn({ name: 'scanned_at' })
  scannedAt!: Date;
}
