import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, Unique, JoinTable } from 'typeorm';
import { UserEntity } from './user.entity';
import { PermissionEntity } from './permission.entity';

@Entity({ name: 'role' })
@Unique('uq_role_name', ['name'])
export class RoleEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 50 })
  name!: string;

  @ManyToMany(() => UserEntity, (u) => u.roles)
  users!: UserEntity[];

  @ManyToMany(() => PermissionEntity, (p) => p.roles)
  @JoinTable({
    name: 'role_permission',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions!: PermissionEntity[];
}
