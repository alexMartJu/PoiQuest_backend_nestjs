import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, QueryFailedError, Repository } from 'typeorm';
import { CitiesRepository } from '../../../domain/repositories/cities.repository';
import { CityEntity } from '../../../domain/entities/city.entity';
import { PartnerStatus } from '../../../domain/enums/partner-status.enum';
import { ConflictError } from '../../../../shared/errors/conflict.error';

@Injectable()
export class TypeormCitiesRepository implements CitiesRepository {
  constructor(
    @InjectRepository(CityEntity)
    private readonly cityRepo: Repository<CityEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async findAllWithCursor(
    cursor: string | undefined,
    limit: number,
    status?: PartnerStatus,
  ): Promise<{ data: CityEntity[]; nextCursor: string | null; hasNextPage: boolean }> {
    const qb = this.cityRepo
      .createQueryBuilder('city')
      .orderBy('city.createdAt', 'ASC')
      .limit(limit + 1);

    if (status) {
      qb.where('city.status = :status', { status });
    }

    if (cursor) {
      const parsed = new Date(cursor);
      const condition = 'city.createdAt > :cursor';
      const params = { cursor: !isNaN(parsed.getTime()) ? parsed : cursor };
      status
        ? qb.andWhere(condition, params)
        : qb.where(condition, params);
    }

    const cities = await qb.getMany();
    const hasNextPage = cities.length > limit;
    if (hasNextPage) cities.pop();

    const nextCursor =
      hasNextPage && cities.length > 0
        ? cities[cities.length - 1].createdAt.toISOString()
        : null;

    return { data: cities, nextCursor, hasNextPage };
  }

  async findOneById(id: number): Promise<CityEntity | null> {
    return await this.cityRepo.findOne({ where: { id } });
  }

  async findOneByUuid(uuid: string): Promise<CityEntity | null> {
    return await this.cityRepo.findOne({ where: { uuid } });
  }

  create(data: Partial<CityEntity>): CityEntity {
    return this.cityRepo.create(data);
  }

  async save(city: CityEntity): Promise<CityEntity> {
    try {
      return await this.cityRepo.save(city);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        const driverErr = (err as any).driverError;
        if (driverErr?.code === 'ER_DUP_ENTRY' || driverErr?.errno === 1062 || driverErr?.code === '23505') {
          throw new ConflictError('Ya existe una ciudad con ese nombre y país', { field: 'name/country' });
        }
      }
      throw err;
    }
  }

  async existsActiveEventsByCity(cityId: number): Promise<boolean> {
    // Usar QueryBuilder de TypeORM en lugar de SQL crudo para mayor claridad.
    // No importamos EventEntity para evitar ciclos — consultamos la tabla `event`.
    const raw = await this.dataSource
      .createQueryBuilder()
      .select('COUNT(*)', 'cnt')
      .from('event', 'event')
      .where('event.city_id = :cityId', { cityId })
      .andWhere('event.status = :status', { status: 'active' })
      .andWhere('event.deleted_at IS NULL')
      .getRawOne();

    return parseInt(raw?.cnt ?? '0', 10) > 0;
  }
}
