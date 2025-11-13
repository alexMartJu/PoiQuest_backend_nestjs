export interface UpdateEventDto {
  name?: string;
  description?: string | null;
  categoryUuid?: string;
  location?: string | null;
  startDate?: string; // formato: YYYY-MM-DD
  endDate?: string | null; // formato: YYYY-MM-DD
  imageUrls?: string[]; // Máximo 2
}
