import {
  Controller, Post, Get, Body, Query,
  HttpCode, HttpStatus, UseGuards,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiOkResponse, ApiBearerAuth,
  ApiBadRequestResponse, ApiNotFoundResponse,
  ApiUnauthorizedResponse, ApiForbiddenResponse, ApiInternalServerErrorResponse,
  ApiBody, ApiQuery,
} from '@nestjs/swagger';
import { TicketValidationService } from '../../application/services/ticket-validation.service';
import { ValidateTicketRequest } from '../dto/requests/validate-ticket.request.dto';
import { ValidateTicketResponse, ValidationHistoryItemResponse } from '../dto/responses/ticket-validation.response.dto';
import { TicketValidationMapper } from '../mappers/ticket-validation.mapper';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { CurrentUser } from '../../../auth/infrastructure/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../../auth/presentation/types/current-user-payload';
import { ErrorResponse } from '../../../shared/dto/error.response.dto';

@ApiTags('ticket-validation')
@Controller('ticket-validation')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ticket_validator')
@ApiBearerAuth()
export class TicketValidationController {
  constructor(private readonly service: TicketValidationService) {}

  @ApiOperation({
    summary: 'Validar un ticket escaneado',
    description: 'Valida el ticket por su UUID, lo marca como usado y registra la validación.',
  })
  @ApiBody({ type: ValidateTicketRequest })
  @ApiOkResponse({ type: ValidateTicketResponse, description: 'Ticket validado correctamente' })
  @ApiBadRequestResponse({ type: ErrorResponse, description: 'Ticket no válido (estado incorrecto)' })
  @ApiNotFoundResponse({ type: ErrorResponse, description: 'Ticket no encontrado' })
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Token inválido o no proporcionado' })
  @ApiForbiddenResponse({ type: ErrorResponse, description: 'No tienes permiso (solo ticket_validator)' })
  @ApiInternalServerErrorResponse({ type: ErrorResponse, description: 'Error interno' })
  @HttpCode(HttpStatus.OK)
  @Post('validate')
  async validate(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: ValidateTicketRequest,
  ): Promise<ValidateTicketResponse> {
    const { validation, ticket } = await this.service.validateTicket(user.userId, dto);
    return TicketValidationMapper.toValidateResponse(validation, ticket);
  }

  @ApiOperation({
    summary: 'Obtener historial de validaciones',
    description: 'Devuelve el historial de validaciones realizadas por el validador. Se puede filtrar por fecha (YYYY-MM-DD).',
  })
  @ApiQuery({ name: 'date', required: false, description: 'Fecha para filtrar (YYYY-MM-DD)', example: '2026-03-30' })
  @ApiOkResponse({ type: [ValidationHistoryItemResponse], description: 'Historial de validaciones' })
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Token inválido o no proporcionado' })
  @ApiForbiddenResponse({ type: ErrorResponse, description: 'No tienes permiso (solo ticket_validator)' })
  @ApiInternalServerErrorResponse({ type: ErrorResponse, description: 'Error interno' })
  @Get('history')
  async getHistory(
    @CurrentUser() user: CurrentUserPayload,
    @Query('date') date?: string,
  ): Promise<ValidationHistoryItemResponse[]> {
    const records = await this.service.getHistory(user.userId, date);
    return TicketValidationMapper.toHistoryItemResponseList(records);
  }
}
