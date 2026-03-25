import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDateString, IsInt, Min, Max } from 'class-validator';

export class CreatePaymentIntentRequest {
  @ApiProperty({ description: 'UUID del evento', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsString()
  @IsNotEmpty()
  eventUuid!: string;

  @ApiProperty({ description: 'Fecha de visita (YYYY-MM-DD)', example: '2026-04-15' })
  @IsDateString()
  @IsNotEmpty()
  visitDate!: string;

  @ApiProperty({ description: 'Cantidad de tickets (1-4)', example: 1, minimum: 1, maximum: 4 })
  @IsInt()
  @Min(1)
  @Max(4)
  quantity!: number;
}
