import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaymentIntentResponse {
  @ApiProperty({ description: 'Client secret de Stripe para Payment Sheet' })
  clientSecret!: string;

  @ApiProperty({ description: 'ID del PaymentIntent de Stripe' })
  paymentIntentId!: string;
}

export class FreeTicketsResponse {
  @ApiProperty({ description: 'Mensaje de confirmación' })
  message!: string;

  @ApiProperty({ description: 'UUIDs de los tickets creados', type: [String] })
  ticketUuids!: string[];
}

export class EventAvailabilityResponse {
  @ApiPropertyOptional({ description: 'Capacidad máxima por día. null = ilimitada', nullable: true })
  capacity!: number | null;

  @ApiProperty({ description: 'Tickets ya vendidos para esa fecha' })
  sold!: number;

  @ApiPropertyOptional({ description: 'Entradas disponibles. null = ilimitadas', nullable: true })
  available!: number | null;
}
