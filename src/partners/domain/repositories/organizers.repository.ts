import { OrganizerEntity } from '../entities/organizer.entity';
import { PartnerStatus } from '../enums/partner-status.enum';

export abstract class OrganizersRepository {
  abstract findAllWithCursor(
    cursor: string | undefined,
    limit: number,
    status?: PartnerStatus,
  ): Promise<{ data: OrganizerEntity[]; nextCursor: string | null; hasNextPage: boolean }>;
  abstract findOneById(id: number): Promise<OrganizerEntity | null>;
  abstract findOneByUuid(uuid: string): Promise<OrganizerEntity | null>;
  abstract create(data: Partial<OrganizerEntity>): OrganizerEntity;
  abstract save(organizer: OrganizerEntity): Promise<OrganizerEntity>;
  abstract existsActiveEventsByOrganizer(organizerId: number): Promise<boolean>;
}
