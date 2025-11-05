export interface UpdateEventDto {
  name?: string;
  description?: string | null;
  type?: string;
  location?: string | null;
  startDate?: string; // formato: YYYY-MM-DD
  endDate?: string | null; // formato: YYYY-MM-DD
}
