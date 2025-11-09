import {
  Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn,
  UpdateDateColumn, DeleteDateColumn, BeforeInsert, OneToMany, Index
} from 'typeorm';
import { randomUUID } from 'crypto';
import { UserEntity } from '../users/domain/entities/user.entity';
import { TicketEntity } from './ticket.entity';
import { ScanEntity } from './scan.entity';
import { UserAchievementEntity } from './user-achievement.entity';

@Entity({ name: 'profile' })
@Index('uq_profile_uuid', ['uuid'], { unique: true })
@Index('uq_profile_user', ['userId'], { unique: true })
export class ProfileEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'char', length: 36, unique: true })
  uuid!: string;

  @BeforeInsert()
  setUuid() {
    if (!this.uuid) this.uuid = randomUUID();
  }

  @Column({ name: 'user_id', type: 'int', unique: true })
  userId!: number;

  @OneToOne(() => UserEntity, (u) => u.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ name: 'name', type: 'varchar', length: 100, nullable: true })
  name?: string | null;

  @Column({ name: 'lastname', type: 'varchar', length: 150, nullable: true })
  lastname?: string | null;

  @Column({ name: 'avatar_url', type: 'varchar', length: 255, nullable: true })
  avatarUrl?: string | null;

  @Column({ name: 'bio', type: 'text', nullable: true })
  bio?: string | null;

  @Column({ name: 'preferences', type: 'json', nullable: true })
  preferences?: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date | null;

  // --- Relations ---
  @OneToMany(() => TicketEntity, (t) => t.profile)
  tickets!: TicketEntity[];

  @OneToMany(() => ScanEntity, (s) => s.profile)
  scans!: ScanEntity[];

  @OneToMany(() => UserAchievementEntity, (ua) => ua.profile)
  userAchievements!: UserAchievementEntity[];
}
