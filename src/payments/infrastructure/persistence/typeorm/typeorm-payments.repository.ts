import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThanOrEqual, Repository } from 'typeorm';
import { TicketEntity, TicketStatus } from '../../../domain/entities/ticket.entity';
import { PaymentsRepository } from '../../../domain/repositories/payments.repository';

@Injectable()
export class TypeormPaymentsRepository implements PaymentsRepository {
  constructor(
    @InjectRepository(TicketEntity)
    private readonly ticketRepo: Repository<TicketEntity>,
  ) {}

  createTicket(data: Partial<TicketEntity>): TicketEntity {
    return this.ticketRepo.create(data);
  }

  async saveTicket(ticket: TicketEntity): Promise<TicketEntity> {
    return this.ticketRepo.save(ticket);
  }

  async findTicketByUuid(uuid: string): Promise<TicketEntity | null> {
    return this.ticketRepo.findOne({
      where: { uuid },
      relations: ['event', 'event.category', 'event.city', 'event.organizer', 'profile'],
    });
  }

  async findTicketByQrCode(qrCode: string): Promise<TicketEntity | null> {
    return this.ticketRepo.findOne({
      where: { qrCode },
      relations: ['event', 'event.category', 'event.city', 'event.organizer', 'profile'],
    });
  }

  async findActiveTicketsByProfileId(profileId: number): Promise<TicketEntity[]> {
    return this.ticketRepo.find({
      where: { profileId, status: TicketStatus.ACTIVE },
      relations: ['event', 'event.city'],
      order: { visitDate: 'ASC', createdAt: 'DESC' },
    });
  }

  async findUsedTicketsByProfileId(profileId: number): Promise<TicketEntity[]> {
    return this.ticketRepo.find({
      where: { profileId, status: TicketStatus.USED },
      relations: ['event', 'event.city'],
      order: { visitDate: 'DESC', createdAt: 'DESC' },
    });
  }

  async countTicketsByProfileEventDate(profileId: number, eventId: number, visitDate: string): Promise<number> {
    return this.ticketRepo.count({
      where: {
        profileId,
        eventId,
        visitDate,
        status: In([TicketStatus.ACTIVE, TicketStatus.USED, TicketStatus.PENDING_PAYMENT]),
      },
    });
  }

  async countTicketsByEventAndDate(eventId: number, visitDate: string): Promise<number> {
    return this.ticketRepo.count({
      where: {
        eventId,
        visitDate,
        status: In([TicketStatus.ACTIVE, TicketStatus.USED, TicketStatus.PENDING_PAYMENT]),
      },
    });
  }

  async findActiveTicketsBeforeOrEqualDate(date: string): Promise<TicketEntity[]> {
    return this.ticketRepo.find({
      where: {
        status: TicketStatus.ACTIVE,
        visitDate: LessThanOrEqual(date),
      },
    });
  }

  async markTicketsAsExpired(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    await this.ticketRepo
      .createQueryBuilder()
      .update(TicketEntity)
      .set({ status: TicketStatus.EXPIRED })
      .whereInIds(ids)
      .execute();
  }

  async updateTicketStatus(ticketId: number, status: TicketStatus): Promise<void> {
    await this.ticketRepo.update(ticketId, { status });
  }
}
