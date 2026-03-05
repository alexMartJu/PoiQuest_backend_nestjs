import { CityEntity } from '../entities/city.entity';
import { PartnerStatus } from '../enums/partner-status.enum';

export abstract class CitiesRepository {
  abstract findAllWithCursor(
    cursor: string | undefined,
    limit: number,
    status?: PartnerStatus,
  ): Promise<{ data: CityEntity[]; nextCursor: string | null; hasNextPage: boolean }>;
  abstract findOneById(id: number): Promise<CityEntity | null>;
  abstract findOneByUuid(uuid: string): Promise<CityEntity | null>;
  abstract create(data: Partial<CityEntity>): CityEntity;
  abstract save(city: CityEntity): Promise<CityEntity>;
  abstract existsActiveEventsByCity(cityId: number): Promise<boolean>;
}
