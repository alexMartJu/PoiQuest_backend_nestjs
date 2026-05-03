import { TicketEntity, TicketStatus } from '../entities/ticket.entity';

export abstract class PaymentsRepository {
  abstract createTicket(data: Partial<TicketEntity>): TicketEntity;
  abstract saveTicket(ticket: TicketEntity): Promise<TicketEntity>;
  abstract findTicketByUuid(uuid: string): Promise<TicketEntity | null>;
  abstract findTicketByQrCode(qrCode: string): Promise<TicketEntity | null>;
  abstract findActiveTicketsByProfileId(profileId: number): Promise<TicketEntity[]>;
  abstract findUsedTicketsByProfileId(profileId: number): Promise<TicketEntity[]>;
  abstract countTicketsByProfileEventDate(profileId: number, eventId: number, visitDate: string): Promise<number>;
  abstract countTicketsByEventAndDate(eventId: number, visitDate: string): Promise<number>;
  abstract findActiveTicketsBeforeOrEqualDate(date: string): Promise<TicketEntity[]>;
  abstract findActiveTicketsByVisitDate(visitDate: string): Promise<TicketEntity[]>;
  abstract markTicketsAsExpired(ids: number[]): Promise<void>;
  abstract updateTicketStatus(ticketId: number, status: TicketStatus): Promise<void>;
}
