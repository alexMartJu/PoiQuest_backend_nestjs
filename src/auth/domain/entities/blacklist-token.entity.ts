import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { UserEntity } from '../../../users/domain/entities/user.entity';

@Entity({ name: 'blacklist_token' })
@Index('idx_blacklist_user', ['userId'])
@Unique(['userId', 'token'])
export class BlacklistTokenEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id', type: 'int' })
  userId!: number;

  @Column({ name: 'token', type: 'varchar', length: 500 })
  token!: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt!: Date;

  @ManyToOne(() => UserEntity, (u) => u.blacklistedTokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;
}
