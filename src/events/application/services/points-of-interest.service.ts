import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PointsOfInterestRepository } from '../../domain/repositories/points-of-interest.repository';
import { EventsRepository } from '../../domain/repositories/events.repository';
import { PointOfInterestEntity } from '../../domain/entities/point-of-interest.entity';
import { CreatePointOfInterestDto } from '../dto/create-point-of-interest.dto';
import { UpdatePointOfInterestDto } from '../dto/update-point-of-interest.dto';
import { NotFoundError } from '../../../shared/errors/not-found.error';
import { ValidationError } from '../../../shared/errors/validation.error';
import { EventStatus } from '../../domain/enums/event-status.enum';
import { ImagesService } from '../../../media/application/services/images.service';
import { ImageableType } from '../../../media/domain/enums/imageable-type.enum';

@Injectable()
export class PointsOfInterestService {
  constructor(
    private readonly poisRepo: PointsOfInterestRepository,
    private readonly eventsRepo: EventsRepository,
    private readonly imagesService: ImagesService,
    private readonly dataSource: DataSource,
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

    // Usar transacción para crear POI e imágenes
    return await this.dataSource.transaction(async (manager) => {
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

      const saved = await manager.save(poi);

      // Adjuntar imágenes (usar manager para atomicidad)
      // Convertir los nombres de archivo a formato de imágenes con bucket
      const images = dto.imageFileNames.map(fileName => ({
        fileName,
        bucket: 'images', // Bucket de imágenes en MinIO
      }));

      await this.imagesService.attachImages({
        imageableType: ImageableType.POI,
        imageableId: saved.id,
        images,
      }, manager);

      return saved;
    });
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

    // Usar transacción para actualizar POI e imágenes
    return await this.dataSource.transaction(async (manager) => {
      if (dto.title !== undefined) poi.title = dto.title;
      if (dto.author !== undefined) poi.author = dto.author ?? null;
      if (dto.description !== undefined) poi.description = dto.description ?? null;
      if (dto.multimedia !== undefined) poi.multimedia = dto.multimedia ?? null;
      if (dto.qrCode !== undefined) poi.qrCode = dto.qrCode;
      if (dto.nfcTag !== undefined) poi.nfcTag = dto.nfcTag ?? null;
      if (dto.coordX !== undefined) poi.coordX = dto.coordX ?? null;
      if (dto.coordY !== undefined) poi.coordY = dto.coordY ?? null;

      const saved = await manager.save(poi);

      // Actualizar imágenes si se proporcionan
      if (dto.imageFileNames !== undefined) {
        // Convertir los nombres de archivo a formato de imágenes con bucket
        const images = dto.imageFileNames.map(fileName => ({
          fileName,
          bucket: 'images', // Bucket de imágenes en MinIO
        }));

        await this.imagesService.updateImages({
          imageableType: ImageableType.POI,
          imageableId: saved.id,
          images,
        }, manager);
      }

      return saved;
    });
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

  /// Obtiene POIs por uuid del evento
  async findByEventUuid(eventUuid: string): Promise<PointOfInterestEntity[]> {
    const event = await this.eventsRepo.findOneByUuid(eventUuid);
    if (!event) {
      throw new NotFoundError(`Evento con UUID ${eventUuid} no encontrado`);
    }
    return await this.poisRepo.findByEventId(event.id);
  }
}
