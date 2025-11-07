import { Injectable } from '@nestjs/common';
import { EventCategoriesRepository } from '../../domain/repositories/event-categories.repository';
// import { EventsRepository } from '../../domain/repositories/events.repository';
import { EventCategoryEntity } from '../../domain/entities/event-category.entity';
import { CreateEventCategoryDto } from '../dto/create-event-category.dto';
import { UpdateEventCategoryDto } from '../dto/update-event-category.dto';
import { NotFoundError } from '../../../shared/errors/not-found.error';
import { ValidationError } from '../../../shared/errors/validation.error';

@Injectable()
export class EventCategoriesService {
  constructor(
    private readonly categoriesRepo: EventCategoriesRepository,
    // private readonly eventsRepo: EventsRepository,
  ) {}

  /// Obtiene todas las categorías (no eliminadas)
  async findAll(): Promise<EventCategoryEntity[]> {
    return await this.categoriesRepo.findAll();
  }

  /// Obtiene una categoría por su uuid
  async findOneByUuid(uuid: string): Promise<EventCategoryEntity> {
    const category = await this.categoriesRepo.findOneByUuid(uuid);
    if (!category) {
      throw new NotFoundError('Categoría de evento no encontrada');
    }
    return category;
  }

  /// Crea una nueva categoría
  async createCategory(dto: CreateEventCategoryDto): Promise<EventCategoryEntity> {
    const category = this.categoriesRepo.create({
      name: dto.name,
      description: dto.description ?? null,
    });

    return await this.categoriesRepo.save(category);
  }

  /// Actualiza una categoría existente por uuid
  async updateByUuid(uuid: string, dto: UpdateEventCategoryDto): Promise<EventCategoryEntity> {
    const category = await this.categoriesRepo.findOneByUuidIncludingDeleted(uuid);
    if (!category) {
      throw new NotFoundError('Categoría de evento no encontrada');
    }
    if (category.deletedAt) {
      throw new NotFoundError('Categoría de evento no encontrada');
    }

    if (dto.name !== undefined) category.name = dto.name;
    if (dto.description !== undefined) category.description = dto.description ?? null;

    return await this.categoriesRepo.save(category);
  }

  /// Elimina una categoría (soft delete) por uuid
  async removeByUuid(uuid: string): Promise<void> {
    const category = await this.categoriesRepo.findOneByUuidIncludingDeleted(uuid);
    if (!category) {
      throw new NotFoundError('Categoría de evento no encontrada');
    }
    if (category.deletedAt) {
      throw new NotFoundError('Categoría de evento no encontrada');
    }

    // Verificar si existen eventos asociados a esta categoría (no eliminados)
    // const hasEvents = await this.eventsRepo.existsByCategoryId(category.id);
    // if (hasEvents) {
    //   throw new ValidationError('No se puede eliminar la categoría porque existen eventos asociados');
    // }

    await this.categoriesRepo.softDeleteByUuid(uuid);
  }
}
