import { EventType } from '../../domain/enums/event-type.enum';

export interface CreateEventDto {
  name: string;
  description?: string | null;
  type: EventType;
  location?: string | null;
  startDate: string; // formato: YYYY-MM-DD
  endDate?: string | null; // formato: YYYY-MM-DD
}
