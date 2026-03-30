import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ValidateTicketResponse {
  @ApiProperty({ description: 'UUID del registro de validación' })
  uuid!: string;

  @ApiProperty({ description: 'Si el ticket fue validado correctamente' })
  valid!: boolean;

  @ApiProperty({ description: 'UUID del ticket validado' })
  ticketUuid!: string;

  @ApiPropertyOptional({ description: 'Nombre del evento' })
  eventName?: string | null;

  @ApiPropertyOptional({ description: 'Ciudad del evento' })
  eventCity?: string | null;

  @ApiProperty({ description: 'Fecha de visita del ticket' })
  visitDate!: string;

  @ApiProperty({ description: 'Fecha y hora de la validación' })
  validatedAt!: Date;
}

export class ValidationHistoryItemResponse {
  @ApiProperty({ description: 'UUID del registro de validación' })
  uuid!: string;

  @ApiProperty({ description: 'Si el ticket fue validado correctamente' })
  valid!: boolean;

  @ApiPropertyOptional({ description: 'Razón del fallo (si no fue válido)' })
  reason?: string | null;

  @ApiPropertyOptional({ description: 'UUID del ticket' })
  ticketUuid?: string | null;

  @ApiPropertyOptional({ description: 'Nombre del evento' })
  eventName?: string | null;

  @ApiPropertyOptional({ description: 'Ciudad del evento' })
  eventCity?: string | null;

  @ApiPropertyOptional({ description: 'Fecha de visita' })
  visitDate?: string | null;

  @ApiProperty({ description: 'Fecha y hora de la validación' })
  validatedAt!: Date;
}
