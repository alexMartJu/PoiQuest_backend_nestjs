export interface CursorPaginationDto {
  cursor?: string;
  limit?: number;
  cityUuid?: string;
  minPrice?: number;
  maxPrice?: number;
  startDate?: string;
  endDate?: string;
}
