import { EventEntity } from '../entities/event.entity';

export interface PaginatedResult {
  data: EventEntity[];
  nextCursor: string | null;
  hasNextPage: boolean;
}
