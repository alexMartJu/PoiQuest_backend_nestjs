import {
  Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn,
  UpdateDateColumn, Index, BeforeInsert,
} from 'typeorm';
import { randomUUID } from 'crypto';
import { PartnerStatus } from '../enums/partner-status.enum';

// Importación diferida para evitar deps circulares en tiempo de carga de módulos
// La relación inversa se resuelve correctamente en runtime por TypeORM
// eslint-disable-next-line @typescript-eslint/no-require-imports
const getEventEntity = () => require('../../../events/domain/entities/event.entity').EventEntity;

@Entity({ name: 'city' })
@Index('uq_city_uuid', ['uuid'], { unique: true })
@Index('uq_city_name_country', ['name', 'country'], { unique: true })
export class CityEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'char', length: 36, unique: true })
  uuid!: string;

  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ type: 'varchar', length: 100 })
  country!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  region?: string | null;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'enum', enum: PartnerStatus, default: PartnerStatus.ACTIVE })
  status!: PartnerStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relations
  @OneToMany(getEventEntity, (e: any) => e.city)
  events!: any[];

  @BeforeInsert()
  generateUuid() {
    if (!this.uuid) {
      this.uuid = randomUUID();
    }
  }
}
