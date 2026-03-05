export interface CreateSponsorDto {
  name: string;
  websiteUrl?: string | null;
  contactEmail?: string | null;
  description?: string | null;
  imageFileNames: string[]; // nombres de archivos en MinIO bucket 'images'
}
