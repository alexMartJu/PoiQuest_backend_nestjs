export interface CreateEventDto {
  name: string;
  description?: string | null;
  categoryUuid: string;
  location?: string | null;
  startDate: string; // formato: YYYY-MM-DD
  endDate?: string | null; // formato: YYYY-MM-DD
  imageFileNames: string[]; // Mínimo 1, máximo 2 - nombres de archivos en MinIO bucket 'images'
}
