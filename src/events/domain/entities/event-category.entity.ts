import {
  Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn,
  UpdateDateColumn, DeleteDateColumn, Index, BeforeInsert
} from 'typeorm';
import { randomUUID } from 'crypto';
import { EventEntity } from './event.entity';

@Entity({ name: 'event_category' })
@Index('uq_event_category_uuid', ['uuid'], { unique: true })
@Index('uq_event_category_name', ['name'], { unique: true })
export class EventCategoryEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'char', length: 36, unique: true })
  uuid!: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date | null;

  // --- Relations ---
  @OneToMany(() => EventEntity, (event) => event.category)
  events!: EventEntity[];

  // Genera el uuid automáticamente antes de insertar
  @BeforeInsert()
  generateUuid() {
    if (!this.uuid) {
      this.uuid = randomUUID();
    }
  }
}
