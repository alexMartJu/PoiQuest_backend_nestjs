export interface UpdatePointOfInterestDto {
  title?: string;
  author?: string | null;
  description?: string | null;
  multimedia?: Record<string, any> | null;
  qrCode?: string;
  nfcTag?: string | null;
  coordX?: number | null;
  coordY?: number | null;
  imageUrls?: string[]; // Máximo 2
}
