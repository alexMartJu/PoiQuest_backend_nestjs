import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { RouteEntity } from './route.entity';
import { PointOfInterestEntity } from './point-of-interest.entity';

@Entity({ name: 'route_poi' })
@Index('uq_route_poi', ['routeId', 'poiId'], { unique: true })
@Index('idx_route_poi_route', ['routeId'])
@Index('idx_route_poi_poi', ['poiId'])
export class RoutePoiEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'route_id', type: 'int' })
  routeId!: number;

  @Column({ name: 'poi_id', type: 'int' })
  poiId!: number;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  // --- Relations ---
  @ManyToOne(() => RouteEntity, (r) => r.routePois, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'route_id' })
  route!: RouteEntity;

  @ManyToOne(() => PointOfInterestEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'poi_id' })
  poi!: PointOfInterestEntity;
}
