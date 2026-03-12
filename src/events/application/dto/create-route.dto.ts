export interface CreateRouteDto {
  eventUuid: string;
  name: string;
  description?: string | null;
  poiUuids: string[]; // Mínimo 2 POIs, en orden deseado
}
