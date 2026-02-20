import { Controller, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { AnalyticsService } from '../../application/services/analytics.service';
import { OverviewResponse } from '../dto/responses/overview.response.dto';
import { EventsByCategoryResponse } from '../dto/responses/events-by-category.response.dto';
import { UsersByMonthResponse } from '../dto/responses/users-by-month.response.dto';
import { AnalyticsMapper } from '../mappers/analytics.mapper';
import { ErrorResponse } from '../../../shared/dto/error.response.dto';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @ApiOperation({
    summary: 'Obtener resumen general de estadísticas',
    description:
      'Devuelve estadísticas generales: total de usuarios, usuarios activos, usuarios recientes (últimos 7 días), total de eventos, eventos activos y total de POIs',
  })
  @ApiOkResponse({ type: OverviewResponse, description: 'Resumen general de estadísticas' })
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Token inválido o no proporcionado' })
  @ApiForbiddenResponse({ type: ErrorResponse, description: 'Acceso denegado: se requiere rol admin' })
  @HttpCode(HttpStatus.OK)
  @Get('overview')
  async getOverview(): Promise<OverviewResponse> {
    const stats = await this.analyticsService.getOverviewStats(7);
    return AnalyticsMapper.toOverviewResponse(stats);
  }

  @ApiOperation({
    summary: 'Obtener número de eventos por categoría',
    description: 'Devuelve la lista de categorías con el número de eventos asociados a cada una',
  })
  @ApiOkResponse({
    type: EventsByCategoryResponse,
    description: 'Lista de categorías con su conteo de eventos',
  })
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Token inválido o no proporcionado' })
  @ApiForbiddenResponse({ type: ErrorResponse, description: 'Acceso denegado: se requiere rol admin' })
  @HttpCode(HttpStatus.OK)
  @Get('events-by-category')
  async getEventsByCategory(): Promise<EventsByCategoryResponse> {
    const data = await this.analyticsService.getEventsByCategory();
    return AnalyticsMapper.toEventsByCategoryResponse(data);
  }

  @ApiOperation({
    summary: 'Obtener número de usuarios registrados por mes',
    description: 'Devuelve la lista de meses con el número de usuarios registrados en cada mes',
  })
  @ApiOkResponse({
    type: UsersByMonthResponse,
    description: 'Lista de meses con su conteo de usuarios registrados',
  })
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Token inválido o no proporcionado' })
  @ApiForbiddenResponse({ type: ErrorResponse, description: 'Acceso denegado: se requiere rol admin' })
  @HttpCode(HttpStatus.OK)
  @Get('users-by-month')
  async getUsersByMonth(): Promise<UsersByMonthResponse> {
    const data = await this.analyticsService.getUsersByMonth();
    return AnalyticsMapper.toUsersByMonthResponse(data);
  }
}
