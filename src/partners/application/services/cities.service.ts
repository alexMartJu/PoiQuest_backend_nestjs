import { Injectable } from '@nestjs/common';
import { CitiesRepository } from '../../domain/repositories/cities.repository';
import { CityEntity } from '../../domain/entities/city.entity';
import { PartnerStatus } from '../../domain/enums/partner-status.enum';
import { CreateCityDto } from '../dto/create-city.dto';
import { UpdateCityDto } from '../dto/update-city.dto';
import { PartnerCursorPaginationDto } from '../dto/partner-cursor-pagination.dto';
import { NotFoundError } from '../../../shared/errors/not-found.error';
import { ValidationError } from '../../../shared/errors/validation.error';

@Injectable()
export class CitiesService {
  constructor(private readonly citiesRepo: CitiesRepository) {}

  /// Lista ciudades con paginación basada en cursor y filtro opcional de estado
  async findAllWithCursor(
    pagination: PartnerCursorPaginationDto,
  ): Promise<{ data: CityEntity[]; nextCursor: string | null; hasNextPage: boolean }> {
    const limit = pagination.limit ?? 10;
    return await this.citiesRepo.findAllWithCursor(pagination.cursor, limit, pagination.status);
  }

  /// Obtiene una ciudad por uuid
  async findOneByUuid(uuid: string): Promise<CityEntity> {
    const city = await this.citiesRepo.findOneByUuid(uuid);
    if (!city) {
      throw new NotFoundError('Ciudad no encontrada', { uuid });
    }
    return city;
  }

  /// Crea una nueva ciudad
  async createCity(dto: CreateCityDto): Promise<CityEntity> {
    const city = this.citiesRepo.create({
      name: dto.name,
      country: dto.country,
      region: dto.region ?? null,
      description: dto.description ?? null,
      status: PartnerStatus.ACTIVE,
    });
    return await this.citiesRepo.save(city);
  }

  /// Actualiza una ciudad por uuid
  async updateByUuid(uuid: string, dto: UpdateCityDto): Promise<CityEntity> {
    const city = await this.citiesRepo.findOneByUuid(uuid);
    if (!city) {
      throw new NotFoundError('Ciudad no encontrada', { uuid });
    }

    if (dto.name !== undefined) city.name = dto.name;
    if (dto.country !== undefined) city.country = dto.country;
    if (dto.region !== undefined) city.region = dto.region ?? null;
    if (dto.description !== undefined) city.description = dto.description ?? null;

    return await this.citiesRepo.save(city);
  }

  /// Deshabilita una ciudad (soft delete lógico: status = DISABLED)
  /// No se permite si hay eventos activos que la utilizan
  async disableByUuid(uuid: string): Promise<void> {
    const city = await this.citiesRepo.findOneByUuid(uuid);
    if (!city) {
      throw new NotFoundError('Ciudad no encontrada', { uuid });
    }
    if (city.status === PartnerStatus.DISABLED) {
      throw new ValidationError('La ciudad ya está deshabilitada', { uuid });
    }

    const hasActiveEvents = await this.citiesRepo.existsActiveEventsByCity(city.id);
    if (hasActiveEvents) {
      throw new ValidationError(
        'No se puede deshabilitar la ciudad porque tiene eventos activos asociados',
        { uuid },
      );
    }

    city.status = PartnerStatus.DISABLED;
    await this.citiesRepo.save(city);
  }
}
