import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  HttpCode, HttpStatus, UseGuards,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiOkResponse, ApiCreatedResponse,
  ApiNotFoundResponse, ApiBadRequestResponse, ApiParam, ApiBody,
  ApiBearerAuth, ApiUnauthorizedResponse, ApiForbiddenResponse,
} from '@nestjs/swagger';
import { RoutesService } from '../../application/services/routes.service';
import { CreateRouteRequest } from '../dto/requests/create-route.request.dto';
import { UpdateRouteRequest } from '../dto/requests/update-route.request.dto';
import { RouteResponse } from '../dto/responses/route.response.dto';
import { RouteMapper } from '../mappers/route.mapper';
import { ErrorResponse } from '../../../shared/dto/error.response.dto';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { Public } from '../../../auth/infrastructure/decorators/public.decorator';

@ApiTags('routes')
@Controller('routes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @ApiOperation({
    summary: 'Lista de rutas de un evento activo o pendiente por su uuid (público)',
    description: 'Devuelve todas las rutas no eliminadas del evento indicado. El evento debe estar en estado ACTIVE o PENDING.',
  })
  @ApiParam({ name: 'eventUuid', description: 'UUID único del evento', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiOkResponse({ type: RouteResponse, isArray: true, description: 'Lista de rutas del evento con sus POIs ordenados' })
  @ApiNotFoundResponse({ type: ErrorResponse, description: 'Evento no encontrado' })
  @ApiBadRequestResponse({ type: ErrorResponse, description: 'El evento está finalizado' })
  @Public()
  @Get('event/:eventUuid')
  async getRoutesByEvent(@Param('eventUuid') eventUuid: string): Promise<RouteResponse[]> {
    const routes = await this.routesService.findByEventUuid(eventUuid);
    return RouteMapper.toResponseList(routes);
  }

  @ApiOperation({ summary: 'Detalle de una ruta por su uuid (público)' })
  @ApiParam({ name: 'uuid', description: 'UUID único de la ruta', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiOkResponse({ type: RouteResponse, description: 'Detalle de la ruta con sus POIs ordenados' })
  @ApiNotFoundResponse({ type: ErrorResponse, description: 'Ruta no encontrada' })
  @Public()
  @Get(':uuid')
  async getRoute(@Param('uuid') uuid: string): Promise<RouteResponse> {
    const route = await this.routesService.findOneByUuid(uuid);
    return RouteMapper.toResponse(route);
  }

  @ApiOperation({
    summary: 'Crear una nueva ruta (admin)',
    description: 'Crea una ruta asociada a un evento. Debe incluir al menos 2 POIs que pertenezcan al mismo evento. El orden del array poiUuids determina el sort_order de cada POI en la ruta.',
  })
  @ApiBody({ type: CreateRouteRequest })
  @ApiCreatedResponse({ type: RouteResponse, description: 'Ruta creada exitosamente' })
  @ApiBadRequestResponse({ type: ErrorResponse, description: 'Datos inválidos, evento finalizado o menos de 2 POIs' })
  @ApiNotFoundResponse({ type: ErrorResponse, description: 'Evento o algún POI no encontrado' })
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Token inválido o no proporcionado' })
  @ApiForbiddenResponse({ type: ErrorResponse, description: 'Acceso denegado: se requiere rol admin' })
  @Roles('admin')
  @Post()
  async createRoute(@Body() dto: CreateRouteRequest): Promise<RouteResponse> {
    const route = await this.routesService.createRoute(dto);
    return RouteMapper.toResponse(route);
  }

  @ApiOperation({
    summary: 'Actualizar una ruta por uuid (admin)',
    description: 'Actualiza nombre, descripción y/o el orden de los POIs de una ruta. Si se envía poiUuids, reemplaza completamente la lista anterior; el orden del array determina el nuevo sort_order.',
  })
  @ApiParam({ name: 'uuid', description: 'UUID único de la ruta', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiBody({ type: UpdateRouteRequest })
  @ApiOkResponse({ type: RouteResponse, description: 'Ruta actualizada exitosamente' })
  @ApiNotFoundResponse({ type: ErrorResponse, description: 'Ruta o algún POI no encontrado' })
  @ApiBadRequestResponse({ type: ErrorResponse, description: 'Datos inválidos o evento finalizado' })
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Token inválido o no proporcionado' })
  @ApiForbiddenResponse({ type: ErrorResponse, description: 'Acceso denegado: se requiere rol admin' })
  @Roles('admin')
  @Patch(':uuid')
  async updateRoute(
    @Param('uuid') uuid: string,
    @Body() dto: UpdateRouteRequest,
  ): Promise<RouteResponse> {
    const route = await this.routesService.updateByUuid(uuid, dto);
    return RouteMapper.toResponse(route);
  }

  @ApiOperation({ summary: 'Eliminar una ruta por uuid (soft delete) (admin)' })
  @ApiParam({ name: 'uuid', description: 'UUID único de la ruta', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiOkResponse({ description: 'Ruta eliminada exitosamente' })
  @ApiNotFoundResponse({ type: ErrorResponse, description: 'Ruta no encontrada' })
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Token inválido o no proporcionado' })
  @ApiForbiddenResponse({ type: ErrorResponse, description: 'Acceso denegado: se requiere rol admin' })
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @Delete(':uuid')
  async deleteRoute(@Param('uuid') uuid: string): Promise<{ message: string }> {
    await this.routesService.removeByUuid(uuid);
    return { message: 'Ruta eliminada exitosamente' };
  }
}
