import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SponsorsRepository } from '../../domain/repositories/sponsors.repository';
import { SponsorEntity } from '../../domain/entities/sponsor.entity';
import { PartnerStatus } from '../../domain/enums/partner-status.enum';
import { CreateSponsorDto } from '../dto/create-sponsor.dto';
import { UpdateSponsorDto } from '../dto/update-sponsor.dto';
import { PartnerCursorPaginationDto } from '../dto/partner-cursor-pagination.dto';
import { NotFoundError } from '../../../shared/errors/not-found.error';
import { ValidationError } from '../../../shared/errors/validation.error';
import { ImagesService } from '../../../media/application/services/images.service';
import { ImageableType } from '../../../media/domain/enums/imageable-type.enum';

@Injectable()
export class SponsorsService {
  constructor(
    private readonly sponsorsRepo: SponsorsRepository,
    private readonly imagesService: ImagesService,
    private readonly dataSource: DataSource,
  ) {}

  /// Lista patrocinadores con paginación basada en cursor y filtro opcional de estado
  async findAllWithCursor(
    pagination: PartnerCursorPaginationDto,
  ): Promise<{ data: SponsorEntity[]; nextCursor: string | null; hasNextPage: boolean }> {
    const limit = pagination.limit ?? 10;
    return await this.sponsorsRepo.findAllWithCursor(pagination.cursor, limit, pagination.status);
  }

  /// Obtiene un patrocinador por uuid
  async findOneByUuid(uuid: string): Promise<SponsorEntity> {
    const sponsor = await this.sponsorsRepo.findOneByUuid(uuid);
    if (!sponsor) {
      throw new NotFoundError('Patrocinador no encontrado', { uuid });
    }
    return sponsor;
  }

  /// Crea un nuevo patrocinador
  async createSponsor(dto: CreateSponsorDto): Promise<SponsorEntity> {
    return await this.dataSource.transaction(async (manager) => {
      const sponsor = this.sponsorsRepo.create({
        name: dto.name,
        websiteUrl: dto.websiteUrl ?? null,
        contactEmail: dto.contactEmail ?? null,
        description: dto.description ?? null,
        status: PartnerStatus.ACTIVE,
      });

      const saved = await manager.save(SponsorEntity, sponsor);

      if (dto.imageFileNames && dto.imageFileNames.length > 0) {
        const images = dto.imageFileNames.map(fileName => ({ fileName, bucket: 'images' }));
        await this.imagesService.attachImages(
          { imageableType: ImageableType.SPONSOR, imageableId: saved.id, images },
          manager,
        );
      }

      return saved;
    });
  }

  /// Actualiza un patrocinador existente por uuid
  async updateByUuid(uuid: string, dto: UpdateSponsorDto): Promise<SponsorEntity> {
    const sponsor = await this.sponsorsRepo.findOneByUuid(uuid);
    if (!sponsor) {
      throw new NotFoundError('Patrocinador no encontrado', { uuid });
    }

    return await this.dataSource.transaction(async (manager) => {
      if (dto.name !== undefined) sponsor.name = dto.name;
      if (dto.websiteUrl !== undefined) sponsor.websiteUrl = dto.websiteUrl ?? null;
      if (dto.contactEmail !== undefined) sponsor.contactEmail = dto.contactEmail ?? null;
      if (dto.description !== undefined) sponsor.description = dto.description ?? null;

      const saved = await manager.save(SponsorEntity, sponsor);

      if (dto.imageFileNames !== undefined) {
        const images = dto.imageFileNames.map(fileName => ({ fileName, bucket: 'images' }));
        await this.imagesService.updateImages(
          { imageableType: ImageableType.SPONSOR, imageableId: saved.id, images },
          manager,
        );
      }

      return saved;
    });
  }

  /// Deshabilita un patrocinador (soft delete lógico: status = DISABLED)
  /// No se permite si hay eventos activos que lo utilizan
  async disableByUuid(uuid: string): Promise<void> {
    const sponsor = await this.sponsorsRepo.findOneByUuid(uuid);
    if (!sponsor) {
      throw new NotFoundError('Patrocinador no encontrado', { uuid });
    }
    if (sponsor.status === PartnerStatus.DISABLED) {
      throw new ValidationError('El patrocinador ya está deshabilitado', { uuid });
    }

    const hasActiveEvents = await this.sponsorsRepo.existsActiveEventsBySponsor(sponsor.id);
    if (hasActiveEvents) {
      throw new ValidationError(
        'No se puede deshabilitar el patrocinador porque tiene eventos activos asociados',
        { uuid },
      );
    }

    sponsor.status = PartnerStatus.DISABLED;
    await this.sponsorsRepo.save(sponsor);
  }
}
