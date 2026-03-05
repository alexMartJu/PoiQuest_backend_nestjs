import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, QueryFailedError, Repository } from 'typeorm';
import { OrganizersRepository } from '../../../domain/repositories/organizers.repository';
import { OrganizerEntity } from '../../../domain/entities/organizer.entity';
import { PartnerStatus } from '../../../domain/enums/partner-status.enum';
import { ConflictError } from '../../../../shared/errors/conflict.error';

@Injectable()
export class TypeormOrganizersRepository implements OrganizersRepository {
  constructor(
    @InjectRepository(OrganizerEntity)
    private readonly organizerRepo: Repository<OrganizerEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async findAllWithCursor(
    cursor: string | undefined,
    limit: number,
    status?: PartnerStatus,
  ): Promise<{ data: OrganizerEntity[]; nextCursor: string | null; hasNextPage: boolean }> {
    const qb = this.organizerRepo
      .createQueryBuilder('organizer')
      .where('organizer.deletedAt IS NULL')
      .orderBy('organizer.createdAt', 'ASC')
      .limit(limit + 1);

    if (status) {
      qb.andWhere('organizer.status = :status', { status });
    }

    if (cursor) {
      const parsed = new Date(cursor);
      qb.andWhere('organizer.createdAt > :cursor', {
        cursor: !isNaN(parsed.getTime()) ? parsed : cursor,
      });
    }

    const organizers = await qb.getMany();
    const hasNextPage = organizers.length > limit;
    if (hasNextPage) organizers.pop();

    const nextCursor =
      hasNextPage && organizers.length > 0
        ? organizers[organizers.length - 1].createdAt.toISOString()
        : null;

    return { data: organizers, nextCursor, hasNextPage };
  }

  async findOneById(id: number): Promise<OrganizerEntity | null> {
    return await this.organizerRepo.findOne({ where: { id, deletedAt: IsNull() } });
  }

  async findOneByUuid(uuid: string): Promise<OrganizerEntity | null> {
    return await this.organizerRepo.findOne({ where: { uuid, deletedAt: IsNull() } });
  }

  create(data: Partial<OrganizerEntity>): OrganizerEntity {
    return this.organizerRepo.create(data);
  }

  async save(organizer: OrganizerEntity): Promise<OrganizerEntity> {
    try {
      return await this.organizerRepo.save(organizer);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        const driverErr = (err as any).driverError;
        if (driverErr?.code === 'ER_DUP_ENTRY' || driverErr?.errno === 1062 || driverErr?.code === '23505') {
          throw new ConflictError('Valor duplicado detectado en organizador', { field: 'uuid' });
        }
      }
      throw err;
    }
  }

  async existsActiveEventsByOrganizer(organizerId: number): Promise<boolean> {
    const raw = await this.dataSource
      .createQueryBuilder()
      .select('COUNT(*)', 'cnt')
      .from('event', 'event')
      .where('event.organizer_id = :organizerId', { organizerId })
      .andWhere('event.status = :status', { status: 'active' })
      .andWhere('event.deleted_at IS NULL')
      .getRawOne();

    return parseInt(raw?.cnt ?? '0', 10) > 0;
  }
}
