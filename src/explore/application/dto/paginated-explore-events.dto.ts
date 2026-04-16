import { TicketEntity } from '../../../payments/domain/entities/ticket.entity';
import { ImageEntity } from '../../../media/domain/entities/image.entity';

export interface ExploreEventItemDto {
  ticket: TicketEntity;
  totalPois: number;
  scannedPois: number;
  primaryImage: ImageEntity | null;
}

export interface PaginatedExploreEventsDto {
  data: ExploreEventItemDto[];
  nextCursor: string | null;
  hasNextPage: boolean;
}
