import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, DeleteDateColumn, Index } from 'typeorm';

export enum ImageableType {
  EVENT = 'event',
  POI = 'poi',
  ROUTE = 'route',
  ACHIEVEMENT = 'achievement',
}

@Entity({ name: 'image' })
@Index('idx_image_poly', ['imageableType', 'imageableId'])
@Index('idx_image_primary', ['imageableType', 'imageableId', 'isPrimary'])
export class ImageEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'image_url', type: 'varchar', length: 255 })
  imageUrl!: string;

  @Column({ name: 'imageable_type', type: 'enum', enum: ImageableType })
  imageableType!: ImageableType;

  @Column({ name: 'imageable_id', type: 'int' })
  imageableId!: number;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ name: 'is_primary', type: 'tinyint', width: 1, default: 0 })
  isPrimary!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date | null;
}
