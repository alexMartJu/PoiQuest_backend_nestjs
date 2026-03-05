import { SponsorEntity } from '../entities/sponsor.entity';
import { PartnerStatus } from '../enums/partner-status.enum';

export abstract class SponsorsRepository {
  abstract findAllWithCursor(
    cursor: string | undefined,
    limit: number,
    status?: PartnerStatus,
  ): Promise<{ data: SponsorEntity[]; nextCursor: string | null; hasNextPage: boolean }>;
  abstract findOneById(id: number): Promise<SponsorEntity | null>;
  abstract findOneByUuid(uuid: string): Promise<SponsorEntity | null>;
  abstract create(data: Partial<SponsorEntity>): SponsorEntity;
  abstract save(sponsor: SponsorEntity): Promise<SponsorEntity>;
  abstract existsActiveEventsBySponsor(sponsorId: number): Promise<boolean>;
}
