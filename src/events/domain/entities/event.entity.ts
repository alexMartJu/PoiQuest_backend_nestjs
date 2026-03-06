import {
  Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, CreateDateColumn,
  UpdateDateColumn, DeleteDateColumn, Index, BeforeInsert,
} from 'typeorm';
import { randomUUID } from 'crypto';
import { PointOfInterestEntity } from './point-of-interest.entity';
import { TicketEntity } from '../../../entities/ticket.entity';
import { RouteEntity } from '../../../entities/route.entity';
import { EventCategoryEntity } from './event-category.entity';
import { EventStatus } from '../enums/event-status.enum';
import { CityEntity } from '../../../partners/domain/entities/city.entity';
import { OrganizerEntity } from '../../../partners/domain/entities/organizer.entity';
import { SponsorEntity } from '../../../partners/domain/entities/sponsor.entity';

@Entity({ name: 'event' })
@Index('uq_event_uuid', ['uuid'], { unique: true })
@Index('idx_event_name', ['name'])
@Index('idx_event_city', ['cityId'])
@Index('idx_event_organizer', ['organizerId'])
export class EventEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'char', length: 36, unique: true })
  uuid!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ name: 'category_id', type: 'int' })
  categoryId!: number;

  @Column({ type: 'enum', enum: EventStatus, default: EventStatus.PENDING })
  status!: EventStatus;

  @Column({ name: 'city_id', type: 'int' })
  cityId!: number;

  @Column({ name: 'organizer_id', type: 'int' })
  organizerId!: number;

  @Column({ name: 'sponsor_id', type: 'int', nullable: true })
  sponsorId?: number | null;

  @Column({ name: 'is_premium', type: 'boolean', default: false })
  isPremium!: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price?: number | null;

  @Column({ name: 'capacity_per_day', type: 'int', nullable: true })
  capacityPerDay?: number | null;

  @Column({ name: 'start_date', type: 'date' })
  startDate!: string;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date | null;

  // --- Relations ---
  @ManyToOne(() => EventCategoryEntity, (category) => category.events, { nullable: false })
  @JoinColumn({ name: 'category_id' })
  category!: EventCategoryEntity;

  @ManyToOne(() => CityEntity, (city) => city.events, { nullable: false })
  @JoinColumn({ name: 'city_id' })
  city!: CityEntity;

  @ManyToOne(() => OrganizerEntity, (organizer) => organizer.events, { nullable: false })
  @JoinColumn({ name: 'organizer_id' })
  organizer!: OrganizerEntity;

  @ManyToOne(() => SponsorEntity, (sponsor) => sponsor.events, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'sponsor_id' })
  sponsor?: SponsorEntity | null;

  @OneToMany(() => PointOfInterestEntity, (poi) => poi.event)
  pointsOfInterest!: PointOfInterestEntity[];

  @OneToMany(() => TicketEntity, (t) => t.event)
  tickets!: TicketEntity[];

  @OneToMany(() => RouteEntity, (r) => r.event)
  routes!: RouteEntity[];

  // Genera el uuid automáticamente antes de insertar
  @BeforeInsert()
  generateUuid() {
    if (!this.uuid) {
      this.uuid = randomUUID();
    }
  }
}
