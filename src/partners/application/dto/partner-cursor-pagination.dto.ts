import { PartnerStatus } from '../../domain/enums/partner-status.enum';

export interface PartnerCursorPaginationDto {
  cursor?: string;
  limit?: number;
  status?: PartnerStatus;
}
