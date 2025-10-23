import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, Index } from 'typeorm';
import { UserAchievementEntity } from './user-achievement.entity';

@Entity({ name: 'achievement' })
@Index('idx_achievement_name', ['name'])
export class AchievementEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'json', nullable: true })
  condition?: Record<string, any> | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  reward?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  // --- Relations ---
  @OneToMany(() => UserAchievementEntity, (ua) => ua.achievement)
  userAchievements!: UserAchievementEntity[];
}
