import { OrganizerType } from '../../domain/enums/organizer-type.enum';

export interface CreateOrganizerDto {
  name: string;
  type: OrganizerType;
  contactEmail: string;
  contactPhone?: string | null;
  description?: string | null;
  imageFileNames: string[]; // nombres de archivos en MinIO bucket 'images'
}
