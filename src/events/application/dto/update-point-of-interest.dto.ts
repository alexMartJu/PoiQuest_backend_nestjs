export interface UpdatePointOfInterestDto {
  title?: string;
  author?: string | null;
  description?: string | null;
  interestingData: string;
  modelFileName: string;
  coordX?: number | null;
  coordY?: number | null;
  imageFileNames?: string[]; // Máximo 2 - nombres de archivos en MinIO bucket 'images'
}
