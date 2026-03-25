import { TicketEntity } from '../../domain/entities/ticket.entity';
import { TicketResponse } from '../dto/responses/ticket.response.dto';

export class TicketMapper {
  static toResponse(ticket: TicketEntity): TicketResponse {
    const isFreeEvent = ticket.qrCode === null;

    return {
      uuid: ticket.uuid,
      eventName: ticket.event?.name ?? '',
      eventUuid: ticket.event?.uuid ?? '',
      eventCity: ticket.event?.city?.name ?? null,
      visitDate: ticket.visitDate,
      status: ticket.status,
      qrCode: isFreeEvent ? null : ticket.qrCode,
      isFreeEvent,
      purchaseDate: ticket.purchaseDate,
    };
  }

  static toResponseList(tickets: TicketEntity[]): TicketResponse[] {
    return tickets.map(t => TicketMapper.toResponse(t));
  }
}
