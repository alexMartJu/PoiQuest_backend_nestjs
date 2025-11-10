import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, QueryFailedError, Not } from 'typeorm';
import { EventsRepository } from '../../../domain/repositories/events.repository';
import { EventEntity } from '../../../domain/entities/event.entity';
import { EventStatus } from '../../../domain/enums/event-status.enum';
import { ConflictError } from '../../../../shared/errors/conflict.error';

@Injectable()
export class TypeormEventsRepository implements EventsRepository {
  constructor(
    @InjectRepository(EventEntity)
    private readonly eventRepo: Repository<EventEntity>,
  ) {}

  async findAll(): Promise<EventEntity[]> {
    // Solo eventos ACTIVOS y no eliminados
    return await this.eventRepo.find({
      order: { createdAt: 'ASC' },
      where: { 
        status: EventStatus.ACTIVE,
        deletedAt: IsNull() 
      },
      relations: ['category'],
    });
  }

  async findOneById(id: number): Promise<EventEntity | null> {
    return await this.eventRepo.findOne({ 
      where: { id, deletedAt: IsNull() },
      relations: ['category'],
    });
  }

  async findOneByUuid(uuid: string): Promise<EventEntity | null> {
    return await this.eventRepo.findOne({ 
      where: { uuid, status: EventStatus.ACTIVE, deletedAt: IsNull() },
      relations: ['category', 'pointsOfInterest'],
    });
  }

  async findOneByUuidIncludingDeleted(uuid: string): Promise<EventEntity | null> {
    // Busca el evento por uuid sin filtrar por status ni deletedAt.
    // withDeleted: true permite recuperar registros soft-deleted.
    return await this.eventRepo.findOne({
      where: { uuid },
      withDeleted: true,
      relations: ['category'],
    });
  }

  async findAllFinished(): Promise<EventEntity[]> {
    // Usar QueryBuilder para asegurar que la relación `category` se cargue
    // incluso si la categoría está soft-deleted.
    return await this.eventRepo.createQueryBuilder('event')
      .leftJoinAndSelect('event.category', 'category')
      .where('event.status = :status', { status: EventStatus.FINISHED })
      .andWhere('event.deletedAt IS NULL')
      .orderBy('event.createdAt', 'ASC')
      .getMany();
  }

  async findFinishedByUuid(uuid: string): Promise<EventEntity | null> {
    return await this.eventRepo.createQueryBuilder('event')
      .leftJoinAndSelect('event.category', 'category')
      .where('event.uuid = :uuid', { uuid })
      .andWhere('event.status = :status', { status: EventStatus.FINISHED })
      .andWhere('event.deletedAt IS NULL')
      .getOne();
  }

  create(data: Partial<EventEntity>): EventEntity {
    return this.eventRepo.create(data);
  }

  async save(event: EventEntity): Promise<EventEntity> {
    try {
      return await this.eventRepo.save(event);
    } catch (err) {
      // Mapear errores técnicos de la BD a errores de dominio
      if (err instanceof QueryFailedError) {
        const driverErr = (err as any).driverError;
        // MySQL/MariaDB ER_DUP_ENTRY (errno 1062), Postgres 23505
        if (driverErr?.code === 'ER_DUP_ENTRY' || driverErr?.errno === 1062 || driverErr?.code === '23505') {
          throw new ConflictError('Valor duplicado en la base de datos', { field: 'uuid' });
        }
      }
      // Re-lanzar otros errores no manejados
      throw err;
    }
  }

  async softDeleteById(id: number): Promise<void> {
    await this.eventRepo.softDelete(id);
  }

  async softDeleteByUuid(uuid: string): Promise<void> {
    const event = await this.findOneByUuid(uuid);
    if (event) {
      await this.eventRepo.softDelete(event.id);
    }
  }

  async existsByCategoryId(categoryId: number): Promise<boolean> {
    // Contar sólo eventos no eliminados y que NO estén en estado FINISHED.
    // Así permitimos eliminar categorías si sus eventos están finalizados.
    const count = await this.eventRepo.count({
      where: { categoryId, deletedAt: IsNull(), status: Not(EventStatus.FINISHED) },
    });
    return count > 0;
  }
}
