import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketValidationEntity } from './domain/entities/ticket-validation.entity';
import { TicketValidationController } from './presentation/controllers/ticket-validation.controller';
import { TicketValidationService } from './application/services/ticket-validation.service';
import { TicketValidationRepository } from './domain/repositories/ticket-validation.repository';
import { TypeormTicketValidationRepository } from './infrastructure/persistence/typeorm/typeorm-ticket-validation.repository';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TicketValidationEntity]),
    PaymentsModule,
  ],
  controllers: [TicketValidationController],
  providers: [
    TicketValidationService,
    { provide: TicketValidationRepository, useClass: TypeormTicketValidationRepository },
  ],
  exports: [TicketValidationService],
})
export class TicketValidationModule {}
