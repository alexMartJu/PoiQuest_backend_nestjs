export interface CreateEventDto {
  name: string;
  description?: string | null;
  categoryUuid: string;
  cityUuid: string;
  organizerUuid: string;
  sponsorUuid?: string | null;
  isPremium: boolean;
  price?: number | null; // Solo si isPremium = true
  capacityPerDay?: number | null; // null = ilimitado
  startDate: string; // formato: YYYY-MM-DD
  endDate?: string | null; // formato: YYYY-MM-DD
  imageFileNames: string[]; // Mínimo 1, máximo 2 - nombres de archivos en MinIO bucket 'images'
}
