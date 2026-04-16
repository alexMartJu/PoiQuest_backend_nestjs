import { ScanEntity } from '../../domain/entities/scan.entity';
import { PointOfInterestEntity } from '../../../events/domain/entities/point-of-interest.entity';

export interface ScanPoiResultDto {
  scan: ScanEntity;
  poi: PointOfInterestEntity;
}
