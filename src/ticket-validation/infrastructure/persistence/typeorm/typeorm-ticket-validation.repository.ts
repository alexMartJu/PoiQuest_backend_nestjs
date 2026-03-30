import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { TicketValidationEntity } from '../../../domain/entities/ticket-validation.entity';
import { TicketValidationRepository } from '../../../domain/repositories/ticket-validation.repository';

@Injectable()
export class TypeormTicketValidationRepository implements TicketValidationRepository {
  constructor(
    @InjectRepository(TicketValidationEntity)
    private readonly repo: Repository<TicketValidationEntity>,
  ) {}

  create(data: Partial<TicketValidationEntity>): TicketValidationEntity {
    return this.repo.create(data);
  }

  async save(entity: TicketValidationEntity): Promise<TicketValidationEntity> {
    return this.repo.save(entity);
  }

  async findByValidatorId(validatorId: number): Promise<TicketValidationEntity[]> {
    return this.repo.find({
      where: { validatorId },
      relations: ['ticket', 'ticket.event', 'ticket.event.city', 'ticket.profile'],
      order: { validatedAt: 'DESC' },
    });
  }

  async findByValidatorIdAndDate(validatorId: number, date: string): Promise<TicketValidationEntity[]> {
    const start = new Date(`${date}T00:00:00`);
    const end = new Date(`${date}T23:59:59.999`);
    return this.repo.find({
      where: {
        validatorId,
        validatedAt: Between(start, end),
      },
      relations: ['ticket', 'ticket.event', 'ticket.event.city', 'ticket.profile'],
      order: { validatedAt: 'DESC' },
    });
  }
}
