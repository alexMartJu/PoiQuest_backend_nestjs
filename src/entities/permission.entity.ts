import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, Unique } from 'typeorm';
import { RoleEntity } from './role.entity';

@Entity({ name: 'permission' })
@Unique('uq_permission_name', ['name'])
export class PermissionEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @ManyToMany(() => RoleEntity, (r) => r.permissions)
  roles!: RoleEntity[];
}
