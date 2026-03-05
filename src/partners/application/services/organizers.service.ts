import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OrganizersRepository } from '../../domain/repositories/organizers.repository';
import { OrganizerEntity } from '../../domain/entities/organizer.entity';
import { PartnerStatus } from '../../domain/enums/partner-status.enum';
import { CreateOrganizerDto } from '../dto/create-organizer.dto';
import { UpdateOrganizerDto } from '../dto/update-organizer.dto';
import { PartnerCursorPaginationDto } from '../dto/partner-cursor-pagination.dto';
import { NotFoundError } from '../../../shared/errors/not-found.error';
import { ValidationError } from '../../../shared/errors/validation.error';
import { ImagesService } from '../../../media/application/services/images.service';
import { ImageableType } from '../../../media/domain/enums/imageable-type.enum';

@Injectable()
export class OrganizersService {
  constructor(
    private readonly organizersRepo: OrganizersRepository,
    private readonly imagesService: ImagesService,
    private readonly dataSource: DataSource,
  ) {}

  /// Lista organizadores con paginación basada en cursor y filtro opcional de estado
  async findAllWithCursor(
    pagination: PartnerCursorPaginationDto,
  ): Promise<{ data: OrganizerEntity[]; nextCursor: string | null; hasNextPage: boolean }> {
    const limit = pagination.limit ?? 10;
    return await this.organizersRepo.findAllWithCursor(pagination.cursor, limit, pagination.status);
  }

  /// Obtiene un organizador por uuid
  async findOneByUuid(uuid: string): Promise<OrganizerEntity> {
    const organizer = await this.organizersRepo.findOneByUuid(uuid);
    if (!organizer) {
      throw new NotFoundError('Organizador no encontrado', { uuid });
    }
    return organizer;
  }

  /// Crea un nuevo organizador
  async createOrganizer(dto: CreateOrganizerDto): Promise<OrganizerEntity> {
    return await this.dataSource.transaction(async (manager) => {
      const organizer = this.organizersRepo.create({
        name: dto.name,
        type: dto.type,
        contactEmail: dto.contactEmail,
        contactPhone: dto.contactPhone ?? null,
        description: dto.description ?? null,
        status: PartnerStatus.ACTIVE,
      });

      const saved = await manager.save(OrganizerEntity, organizer);

      if (dto.imageFileNames && dto.imageFileNames.length > 0) {
        const images = dto.imageFileNames.map(fileName => ({ fileName, bucket: 'images' }));
        await this.imagesService.attachImages(
          { imageableType: ImageableType.ORGANIZER, imageableId: saved.id, images },
          manager,
        );
      }

      return saved;
    });
  }

  /// Actualiza un organizador existente por uuid
  async updateByUuid(uuid: string, dto: UpdateOrganizerDto): Promise<OrganizerEntity> {
    const organizer = await this.organizersRepo.findOneByUuid(uuid);
    if (!organizer) {
      throw new NotFoundError('Organizador no encontrado', { uuid });
    }

    return await this.dataSource.transaction(async (manager) => {
      if (dto.name !== undefined) organizer.name = dto.name;
      if (dto.type !== undefined) organizer.type = dto.type;
      if (dto.contactEmail !== undefined) organizer.contactEmail = dto.contactEmail;
      if (dto.contactPhone !== undefined) organizer.contactPhone = dto.contactPhone ?? null;
      if (dto.description !== undefined) organizer.description = dto.description ?? null;

      const saved = await manager.save(OrganizerEntity, organizer);

      if (dto.imageFileNames !== undefined) {
        const images = dto.imageFileNames.map(fileName => ({ fileName, bucket: 'images' }));
        await this.imagesService.updateImages(
          { imageableType: ImageableType.ORGANIZER, imageableId: saved.id, images },
          manager,
        );
      }

      return saved;
    });
  }

  /// Deshabilita un organizador (soft delete lógico: status = DISABLED)
  /// No se permite si hay eventos activos que lo utilizan
  async disableByUuid(uuid: string): Promise<void> {
    const organizer = await this.organizersRepo.findOneByUuid(uuid);
    if (!organizer) {
      throw new NotFoundError('Organizador no encontrado', { uuid });
    }
    if (organizer.status === PartnerStatus.DISABLED) {
      throw new ValidationError('El organizador ya está deshabilitado', { uuid });
    }

    const hasActiveEvents = await this.organizersRepo.existsActiveEventsByOrganizer(organizer.id);
    if (hasActiveEvents) {
      throw new ValidationError(
        'No se puede deshabilitar el organizador porque tiene eventos activos asociados',
        { uuid },
      );
    }

    organizer.status = PartnerStatus.DISABLED;
    await this.organizersRepo.save(organizer);
  }
}
