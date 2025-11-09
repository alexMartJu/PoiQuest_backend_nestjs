import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, Unique } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'role' })
@Unique('uq_role_name', ['name'])
export class RoleEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 50 })
  name!: string;

  @ManyToMany(() => UserEntity, (u) => u.roles)
  users!: UserEntity[];
}
