import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique, Index
} from 'typeorm';
import { ProfileEntity } from './profile.entity';
import { AchievementEntity } from './achievement.entity';

@Entity({ name: 'user_achievement' })
@Unique('uq_user_achievement', ['profileId', 'achievementId'])
@Index('idx_userachievement_profile', ['profileId'])
@Index('idx_userachievement_achievement', ['achievementId'])
export class UserAchievementEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'profile_id', type: 'int' })
  profileId!: number;

  @ManyToOne(() => ProfileEntity, (p) => p.userAchievements, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profile_id' })
  profile!: ProfileEntity;

  @Column({ name: 'achievement_id', type: 'int' })
  achievementId!: number;

  @ManyToOne(() => AchievementEntity, (a) => a.userAchievements, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'achievement_id' })
  achievement!: AchievementEntity;

  @CreateDateColumn({ name: 'unlocked_at' })
  unlockedAt!: Date;
}
