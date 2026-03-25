import {
  Controller, Get, Post, Body, Query,
  HttpCode, HttpStatus, UseGuards,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiOkResponse, ApiCreatedResponse,
  ApiBadRequestResponse, ApiNotFoundResponse, ApiBearerAuth,
  ApiUnauthorizedResponse, ApiForbiddenResponse, ApiInternalServerErrorResponse,
  ApiQuery, ApiBody,
} from '@nestjs/swagger';
import { PaymentsService } from '../../application/services/payments.service';
import { CreatePaymentIntentRequest } from '../dto/requests/create-payment-intent.request.dto';
import { ConfirmPaymentRequest } from '../dto/requests/confirm-payment.request.dto';
import { CreateFreeTicketsRequest } from '../dto/requests/create-free-tickets.request.dto';
import { TicketResponse } from '../dto/responses/ticket.response.dto';
import { PaymentIntentResponse, FreeTicketsResponse, EventAvailabilityResponse } from '../dto/responses/payment.response.dto';
import { TicketMapper } from '../mappers/ticket.mapper';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/infrastructure/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../../auth/presentation/types/current-user-payload';
import { ErrorResponse } from '../../../shared/dto/error.response.dto';
import { Public } from '../../../auth/infrastructure/decorators/public.decorator';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @ApiOperation({
    summary: 'Crear PaymentIntent para compra de tickets de evento de pago',
    description: 'Crea un PaymentIntent en Stripe y devuelve el clientSecret para la Payment Sheet. Límite 4 tickets por usuario/evento/fecha.',
  })
  @ApiBody({ type: CreatePaymentIntentRequest })
  @ApiCreatedResponse({ type: PaymentIntentResponse, description: 'PaymentIntent creado' })
  @ApiBadRequestResponse({ type: ErrorResponse, description: 'Datos inválidos o límite excedido' })
  @ApiNotFoundResponse({ type: ErrorResponse, description: 'Evento no encontrado' })
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Token inválido o no proporcionado' })
  @ApiInternalServerErrorResponse({ type: ErrorResponse, description: 'Error interno' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('create-payment-intent')
  async createPaymentIntent(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreatePaymentIntentRequest,
  ): Promise<PaymentIntentResponse> {
    const result = await this.paymentsService.createPaymentIntent(user.userId, dto);
    return {
      clientSecret: result.clientSecret!,
      paymentIntentId: result.paymentIntentId,
    };
  }

  @ApiOperation({
    summary: 'Confirmar pago completado y activar tickets',
    description: 'Verifica el PaymentIntent en Stripe y activa los tickets asociados.',
  })
  @ApiBody({ type: ConfirmPaymentRequest })
  @ApiOkResponse({ description: 'Pago confirmado y tickets activados' })
  @ApiBadRequestResponse({ type: ErrorResponse, description: 'Pago no completado' })
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Token inválido o no proporcionado' })
  @ApiForbiddenResponse({ type: ErrorResponse, description: 'No tienes permiso para confirmar este pago' })
  @ApiInternalServerErrorResponse({ type: ErrorResponse, description: 'Error interno' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('confirm-payment')
  async confirmPayment(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: ConfirmPaymentRequest,
  ): Promise<{ message: string }> {
    return this.paymentsService.confirmPayment(user.userId, dto.paymentIntentId);
  }

  @ApiOperation({
    summary: 'Obtener tickets gratuitos de un evento',
    description: 'Crea tickets activos sin pago para eventos gratuitos. Límite 4 por usuario/evento/fecha.',
  })
  @ApiBody({ type: CreateFreeTicketsRequest })
  @ApiCreatedResponse({ type: FreeTicketsResponse, description: 'Tickets gratuitos creados' })
  @ApiBadRequestResponse({ type: ErrorResponse, description: 'Datos inválidos o límite excedido' })
  @ApiNotFoundResponse({ type: ErrorResponse, description: 'Evento no encontrado' })
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Token inválido o no proporcionado' })
  @ApiInternalServerErrorResponse({ type: ErrorResponse, description: 'Error interno' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('free-tickets')
  async createFreeTickets(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateFreeTicketsRequest,
  ): Promise<FreeTicketsResponse> {
    const result = await this.paymentsService.createFreeTickets(user.userId, dto);
    return {
      message: result.message,
      ticketUuids: result.tickets.map(t => t.uuid),
    };
  }

  @ApiOperation({ summary: 'Obtener tickets activos del usuario logueado' })
  @ApiOkResponse({ type: [TicketResponse], description: 'Lista de tickets activos' })
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Token inválido o no proporcionado' })
  @ApiInternalServerErrorResponse({ type: ErrorResponse, description: 'Error interno' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('my-tickets/active')
  async getActiveTickets(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<TicketResponse[]> {
    const tickets = await this.paymentsService.getActiveTickets(user.userId);
    return TicketMapper.toResponseList(tickets);
  }

  @ApiOperation({ summary: 'Obtener tickets usados del usuario logueado' })
  @ApiOkResponse({ type: [TicketResponse], description: 'Lista de tickets usados' })
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Token inválido o no proporcionado' })
  @ApiInternalServerErrorResponse({ type: ErrorResponse, description: 'Error interno' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('my-tickets/used')
  async getUsedTickets(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<TicketResponse[]> {
    const tickets = await this.paymentsService.getUsedTickets(user.userId);
    return TicketMapper.toResponseList(tickets);
  }

  @ApiOperation({
    summary: 'Consultar disponibilidad de un evento para una fecha',
    description: 'Devuelve la capacidad, tickets vendidos y entradas disponibles para una fecha concreta.',
  })
  @ApiQuery({ name: 'eventUuid', required: true, type: String, description: 'UUID del evento' })
  @ApiQuery({ name: 'visitDate', required: true, type: String, description: 'Fecha de visita (YYYY-MM-DD)' })
  @ApiOkResponse({ type: EventAvailabilityResponse, description: 'Disponibilidad del evento' })
  @ApiNotFoundResponse({ type: ErrorResponse, description: 'Evento no encontrado' })
  @ApiBadRequestResponse({ type: ErrorResponse, description: 'Fecha inválida' })
  @ApiInternalServerErrorResponse({ type: ErrorResponse, description: 'Error interno' })
  @Public()
  @Get('availability')
  async getEventAvailability(
    @Query('eventUuid') eventUuid: string,
    @Query('visitDate') visitDate: string,
  ): Promise<EventAvailabilityResponse> {
    return this.paymentsService.getEventAvailability(eventUuid, visitDate);
  }
}
