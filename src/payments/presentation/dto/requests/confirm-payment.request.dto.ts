import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ConfirmPaymentRequest {
  @ApiProperty({ description: 'ID del PaymentIntent de Stripe', example: 'pi_1234567890' })
  @IsString()
  @IsNotEmpty()
  paymentIntentId!: string;
}
