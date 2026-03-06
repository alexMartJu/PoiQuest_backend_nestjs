import { EventAdminFilter } from '../../domain/enums/event-admin-filter.enum';

export interface AdminEventsPaginationDto {
  filter: EventAdminFilter;
  cursor?: string;
  limit?: number;
}
