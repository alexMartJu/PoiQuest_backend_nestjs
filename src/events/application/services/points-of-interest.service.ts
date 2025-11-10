import { Injectable } from '@nestjs/common';
import { PointsOfInterestRepository } from '../../domain/repositories/points-of-interest.repository';
import { EventsRepository } from '../../domain/repositories/events.repository';
import { PointOfInterestEntity } from '../../domain/entities/point-of-interest.entity';
import { CreatePointOfInterestDto } from '../dto/create-point-of-interest.dto';
import { UpdatePointOfInterestDto } from '../dto/update-point-of-interest.dto';
import { NotFoundError } from '../../../shared/errors/not-found.error';
import { ValidationError } from '../../../shared/errors/validation.error';
import { EventStatus } from '../../domain/enums/event-status.enum';

@Injectable()
export class PointsOfInterestService {
  constructor(
    private readonly poisRepo: PointsOfInterestRepository,
    private readonly eventsRepo: EventsRepository,
  ) {}

  /// Obtiene todos los POIs (no eliminados)
  async findAll(): Promise<PointOfInterestEntity[]> {
    return await this.poisRepo.findAll();
  }

  /// Obtiene un POI por su uuid
  async findOneByUuid(uuid: string): Promise<PointOfInterestEntity> {
    const poi = await this.poisRepo.findOneByUuid(uuid);
    if (!poi) {
      throw new NotFoundError('Point of Interest no encontrado');
    }
    return poi;
  }

  /// Crea un nuevo Point of Interest
  async createPoi(dto: CreatePointOfInterestDto): Promise<PointOfInterestEntity> {
    // Validar que el evento existe
    const event = await this.eventsRepo.findOneByUuidIncludingDeleted(dto.eventUuid);
    if (!event) {
      throw new NotFoundError(`Evento con UUID ${dto.eventUuid} no encontrado`);
    }
    if (event.deletedAt) {
      throw new ValidationError('No se puede asociar un POI a un evento eliminado');
    }
    // No permitir crear POIs en eventos deshabilitados/que no estén ACTIVE
    if (event.status !== EventStatus.ACTIVE) {
      throw new ValidationError('No se puede asociar un POI a un evento deshabilitado o no activo');
    }

    const poi = this.poisRepo.create({
      eventId: event.id,
      title: dto.title,
      author: dto.author ?? null,
      description: dto.description ?? null,
      multimedia: dto.multimedia ?? null,
      qrCode: dto.qrCode,
      nfcTag: dto.nfcTag ?? null,
      coordX: dto.coordX ?? null,
      coordY: dto.coordY ?? null,
    });

    return await this.poisRepo.save(poi);
  }

  /// Actualiza un POI existente por uuid
  async updateByUuid(uuid: string, dto: UpdatePointOfInterestDto): Promise<PointOfInterestEntity> {
    const poi = await this.poisRepo.findOneByUuidIncludingDeleted(uuid);
    if (!poi) {
      throw new NotFoundError('Point of Interest no encontrado');
    }
    if (poi.deletedAt) {
      throw new ValidationError('No se puede actualizar un Point of Interest eliminado');
    }

    if (dto.title !== undefined) poi.title = dto.title;
    if (dto.author !== undefined) poi.author = dto.author ?? null;
    if (dto.description !== undefined) poi.description = dto.description ?? null;
    if (dto.multimedia !== undefined) poi.multimedia = dto.multimedia ?? null;
    if (dto.qrCode !== undefined) poi.qrCode = dto.qrCode;
    if (dto.nfcTag !== undefined) poi.nfcTag = dto.nfcTag ?? null;
    if (dto.coordX !== undefined) poi.coordX = dto.coordX ?? null;
    if (dto.coordY !== undefined) poi.coordY = dto.coordY ?? null;

    return await this.poisRepo.save(poi);
  }

  /// Elimina un POI (soft delete) por uuid
  async removeByUuid(uuid: string): Promise<void> {
    const poi = await this.poisRepo.findOneByUuidIncludingDeleted(uuid);
    if (!poi) {
      throw new NotFoundError('Point of Interest no encontrado');
    }
    if (poi.deletedAt) {
      throw new ValidationError('El Point of Interest ya ha sido eliminado');
    }

    await this.poisRepo.softDeleteByUuid(uuid);
  }

  /// Obtiene POIs por eventId (usado internamente)
  async findByEventId(eventId: number): Promise<PointOfInterestEntity[]> {
    return await this.poisRepo.findByEventId(eventId);
  }
}
