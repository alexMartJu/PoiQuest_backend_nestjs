import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'blacklist_token' })
@Index('idx_blacklist_user', ['userId'])
export class BlacklistTokenEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  token!: string;

  @Column({ name: 'user_id', type: 'int' })
  userId!: number;

  @ManyToOne(() => UserEntity, (u) => u.blacklistedTokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ name: 'revoked_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  revokedAt!: Date;

  @Column({ name: 'reason', type: 'varchar', length: 255, nullable: true })
  reason?: string | null;
}
