import { TicketValidationEntity } from '../entities/ticket-validation.entity';

export abstract class TicketValidationRepository {
  abstract create(data: Partial<TicketValidationEntity>): TicketValidationEntity;
  abstract save(entity: TicketValidationEntity): Promise<TicketValidationEntity>;
  abstract findByValidatorId(validatorId: number): Promise<TicketValidationEntity[]>;
  abstract findByValidatorIdAndDate(validatorId: number, date: string): Promise<TicketValidationEntity[]>;
}
