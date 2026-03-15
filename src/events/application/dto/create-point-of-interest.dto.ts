export interface CreatePointOfInterestDto {
  eventUuid: string;
  title: string;
  author?: string | null;
  description?: string | null;
  interestingData: string;
  modelFileName: string;
  coordX?: number | null;
  coordY?: number | null;
  imageFileNames: string[]; // Mínimo 1, máximo 2 - nombres de archivos en MinIO bucket 'images'
}
