import { CityEntity } from '../../domain/entities/city.entity';
import { CityResponse } from '../dto/responses/city.response.dto';

export class CityMapper {
  static toResponse(city: CityEntity | null): CityResponse | null {
    if (!city) return null;
    return {
      uuid: city.uuid,
      name: city.name,
      country: city.country,
      region: city.region ?? null,
      description: city.description ?? null,
      status: city.status,
      createdAt: city.createdAt,
      updatedAt: city.updatedAt,
    };
  }

  static toResponseList(list: CityEntity[]): CityResponse[] {
    return list.map(c => this.toResponse(c)!);
  }
}
