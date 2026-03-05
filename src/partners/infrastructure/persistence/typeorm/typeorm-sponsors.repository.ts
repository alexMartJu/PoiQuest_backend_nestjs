import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, QueryFailedError, Repository } from 'typeorm';
import { SponsorsRepository } from '../../../domain/repositories/sponsors.repository';
import { SponsorEntity } from '../../../domain/entities/sponsor.entity';
import { PartnerStatus } from '../../../domain/enums/partner-status.enum';
import { ConflictError } from '../../../../shared/errors/conflict.error';

@Injectable()
export class TypeormSponsorsRepository implements SponsorsRepository {
  constructor(
    @InjectRepository(SponsorEntity)
    private readonly sponsorRepo: Repository<SponsorEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async findAllWithCursor(
    cursor: string | undefined,
    limit: number,
    status?: PartnerStatus,
  ): Promise<{ data: SponsorEntity[]; nextCursor: string | null; hasNextPage: boolean }> {
    const qb = this.sponsorRepo
      .createQueryBuilder('sponsor')
      .where('sponsor.deletedAt IS NULL')
      .orderBy('sponsor.createdAt', 'ASC')
      .limit(limit + 1);

    if (status) {
      qb.andWhere('sponsor.status = :status', { status });
    }

    if (cursor) {
      const parsed = new Date(cursor);
      qb.andWhere('sponsor.createdAt > :cursor', {
        cursor: !isNaN(parsed.getTime()) ? parsed : cursor,
      });
    }

    const sponsors = await qb.getMany();
    const hasNextPage = sponsors.length > limit;
    if (hasNextPage) sponsors.pop();

    const nextCursor =
      hasNextPage && sponsors.length > 0
        ? sponsors[sponsors.length - 1].createdAt.toISOString()
        : null;

    return { data: sponsors, nextCursor, hasNextPage };
  }

  async findOneById(id: number): Promise<SponsorEntity | null> {
    return await this.sponsorRepo.findOne({ where: { id, deletedAt: IsNull() } });
  }

  async findOneByUuid(uuid: string): Promise<SponsorEntity | null> {
    return await this.sponsorRepo.findOne({ where: { uuid, deletedAt: IsNull() } });
  }

  create(data: Partial<SponsorEntity>): SponsorEntity {
    return this.sponsorRepo.create(data);
  }

  async save(sponsor: SponsorEntity): Promise<SponsorEntity> {
    try {
      return await this.sponsorRepo.save(sponsor);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        const driverErr = (err as any).driverError;
        if (driverErr?.code === 'ER_DUP_ENTRY' || driverErr?.errno === 1062 || driverErr?.code === '23505') {
          throw new ConflictError('Valor duplicado detectado en patrocinador', { field: 'uuid' });
        }
      }
      throw err;
    }
  }

  async existsActiveEventsBySponsor(sponsorId: number): Promise<boolean> {
    const raw = await this.dataSource
      .createQueryBuilder()
      .select('COUNT(*)', 'cnt')
      .from('event', 'event')
      .where('event.sponsor_id = :sponsorId', { sponsorId })
      .andWhere('event.status = :status', { status: 'active' })
      .andWhere('event.deleted_at IS NULL')
      .getRawOne();

    return parseInt(raw?.cnt ?? '0', 10) > 0;
  }
}
