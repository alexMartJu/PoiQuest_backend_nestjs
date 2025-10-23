import {
  Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, ManyToMany, JoinTable,
  CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index
} from 'typeorm';
import { ProfileEntity } from './profile.entity';
import { BlacklistTokenEntity } from './blacklist-token.entity';
import { RoleEntity } from './role.entity';
import { NotificationEntity } from './notification.entity';
import { IncidentEntity } from './incident.entity';

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
}

@Entity({ name: 'user' })
@Index('uq_user_email', ['email'], { unique: true })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({ type: 'text', nullable: true })
  refreshToken?: string | null;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status!: UserStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date | null;

  // --- Relations ---
  @OneToOne(() => ProfileEntity, (p) => p.user)
  profile!: ProfileEntity;

  @OneToMany(() => BlacklistTokenEntity, (bt) => bt.user)
  blacklistedTokens!: BlacklistTokenEntity[];

  @ManyToMany(() => RoleEntity, (r) => r.users)
  @JoinTable({
    name: 'user_role',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles!: RoleEntity[];

  @OneToMany(() => NotificationEntity, (n) => n.user)
  notifications!: NotificationEntity[];

  @OneToMany(() => IncidentEntity, (i) => i.user)
  incidents!: IncidentEntity[];
}
