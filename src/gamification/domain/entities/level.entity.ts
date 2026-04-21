import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, Index, BeforeInsert,
} from 'typeorm';
import { randomUUID } from 'crypto';

@Entity({ name: 'level' })
@Index('uq_level_uuid', ['uuid'], { unique: true })
@Index('uq_level_level', ['level'], { unique: true })
export class LevelEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'char', length: 36, unique: true })
  uuid!: string;

  @Column({ type: 'int', unique: true })
  level!: number;

  @Column({ type: 'varchar', length: 100 })
  title!: string;

  @Column({ name: 'min_points', type: 'int' })
  minPoints!: number;

  @Column({ type: 'int', default: 0 })
  discount!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reward?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @BeforeInsert()
  generateUuid() {
    if (!this.uuid) {
      this.uuid = randomUUID();
    }
  }
}
