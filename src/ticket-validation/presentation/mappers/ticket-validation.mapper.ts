import { TicketValidationEntity } from '../../domain/entities/ticket-validation.entity';
import { TicketEntity } from '../../../payments/domain/entities/ticket.entity';
import { ValidateTicketResponse, ValidationHistoryItemResponse } from '../dto/responses/ticket-validation.response.dto';

export class TicketValidationMapper {
  static toValidateResponse(
    validation: TicketValidationEntity,
    ticket: TicketEntity,
  ): ValidateTicketResponse {
    return {
      uuid: validation.uuid,
      valid: true,
      ticketUuid: ticket.uuid,
      eventName: ticket.event?.name ?? null,
      eventCity: ticket.event?.city?.name ?? null,
      visitDate: ticket.visitDate,
      validatedAt: validation.validatedAt,
    };
  }

  static toHistoryItemResponse(record: TicketValidationEntity): ValidationHistoryItemResponse {
    return {
      uuid: record.uuid,
      valid: record.valid,
      reason: record.reason ?? null,
      ticketUuid: record.ticket?.uuid ?? null,
      eventName: record.ticket?.event?.name ?? null,
      eventCity: record.ticket?.event?.city?.name ?? null,
      visitDate: record.ticket?.visitDate ?? null,
      validatedAt: record.validatedAt,
    };
  }

  static toHistoryItemResponseList(records: TicketValidationEntity[]): ValidationHistoryItemResponse[] {
    return records.map(r => TicketValidationMapper.toHistoryItemResponse(r));
  }
}
