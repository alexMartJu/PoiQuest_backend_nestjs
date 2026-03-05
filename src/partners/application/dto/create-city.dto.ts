export interface CreateCityDto {
  name: string;
  country: string;
  region?: string | null;
  description?: string | null;
}
