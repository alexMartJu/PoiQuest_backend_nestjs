import { EventEntity } from '../../domain/entities/event.entity';

export interface PaginatedEventsDto {
  data: EventEntity[];
  nextCursor: string | null;
  hasNextPage: boolean;
}
