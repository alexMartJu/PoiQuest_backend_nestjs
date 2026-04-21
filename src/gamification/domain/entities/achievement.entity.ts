import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToMany, Index, BeforeInsert,
} from 'typeorm';
import { randomUUID } from 'crypto';
import { UserAchievementEntity } from './user-achievement.entity';
import { AchievementCategory } from '../enums/achievement-category.enum';

export { AchievementCategory };

@Entity({ name: 'achievement' })
@Index('idx_achievement_category', ['category'])
@Index('idx_achievement_key', ['key'], { unique: true })
@Index('uq_achievement_uuid', ['uuid'], { unique: true })
export class AchievementEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'char', length: 36, unique: true })
  uuid!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  key!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'enum', enum: AchievementCategory })
  category!: AchievementCategory;

  @Column({ type: 'int' })
  threshold!: number;

  @Column({ type: 'int' })
  points!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // --- Relations ---
  @OneToMany(() => UserAchievementEntity, (ua) => ua.achievement)
  userAchievements!: UserAchievementEntity[];

  @BeforeInsert()
  generateUuid() {
    if (!this.uuid) {
      this.uuid = randomUUID();
    }
  }
}
