import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketStatus } from '../../../domain/entities/ticket.entity';

export class TicketResponse {
  @ApiProperty({ description: 'UUID único del ticket', example: '550e8400-e29b-41d4-a716-446655440000' })
  uuid!: string;

  @ApiProperty({ description: 'Nombre del evento' })
  eventName!: string;

  @ApiProperty({ description: 'UUID del evento' })
  eventUuid!: string;

  @ApiPropertyOptional({ description: 'Ciudad del evento', nullable: true })
  eventCity?: string | null;

  @ApiProperty({ description: 'Fecha de visita (YYYY-MM-DD)' })
  visitDate!: string;

  @ApiProperty({ enum: TicketStatus, description: 'Estado del ticket' })
  status!: TicketStatus;

  @ApiPropertyOptional({ description: 'Código QR (solo para tickets de pago)', nullable: true })
  qrCode?: string | null;

  @ApiProperty({ description: 'Indica si el ticket es de un evento gratuito' })
  isFreeEvent!: boolean;

  @ApiProperty({ description: 'Fecha de compra en ISO 8601' })
  purchaseDate!: Date;
}
