export interface UpdateRouteDto {
  name?: string;
  description?: string | null;
  poiUuids?: string[]; // Mínimo 2 POIs si se actualiza; el orden determina sort_order
}
