export interface CreateEventDto {
  name: string;
  description?: string | null;
  categoryUuid: string;
  location?: string | null;
  startDate: string; // formato: YYYY-MM-DD
  endDate?: string | null; // formato: YYYY-MM-DD
}
