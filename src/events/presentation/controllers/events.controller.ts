import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  HttpCode, HttpStatus, UseGuards
} from '@nestjs/common';
import { EventsService } from '../../application/services/events.service';
import { CreateEventRequest } from '../dto/requests/create-event.request.dto';
import { UpdateEventRequest } from '../dto/requests/update-event.request.dto';
import { EventResponse } from '../dto/responses/event.response.dto';
import { EventMapper } from '../mappers/event.mapper';
import { 
  ApiTags, ApiOperation, ApiOkResponse, ApiCreatedResponse, 
  ApiNotFoundResponse, ApiBadRequestResponse, ApiConflictResponse, ApiBody, ApiParam,
  ApiBearerAuth, ApiUnauthorizedResponse, ApiForbiddenResponse
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { Public } from '../../../auth/infrastructure/decorators/public.decorator';
import { ErrorResponse } from '../../../shared/dto/error.response.dto';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @ApiOperation({ summary: 'Lista de todos los eventos activos' })
  @ApiOkResponse({ type: EventResponse, isArray: true, description: 'Lista de eventos activos' })
  @Public()
  @Get()
  async getEvents(): Promise<EventResponse[]> {
    const entities = await this.eventsService.findAll();
    return EventMapper.toResponseList(entities);
  }

  @ApiOperation({ summary: 'Lista de eventos finalizados' })
  @ApiOkResponse({ type: EventResponse, isArray: true, description: 'Lista de eventos finalizados' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Token inválido o no proporcionado' })
  @ApiForbiddenResponse({ type: ErrorResponse, description: 'Acceso denegado: se requiere rol admin' })
  @Get('finished')
  async getFinishedEvents(): Promise<EventResponse[]> {
    const entities = await this.eventsService.findAllFinished();
    return EventMapper.toResponseList(entities);
  }

  @ApiOperation({ summary: 'Detalle de un evento activo por uuid (incluye POIs)' })
  @ApiParam({ name: 'uuid', description: 'UUID único del evento activo', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiOkResponse({ type: EventResponse, description: 'Detalle del evento activo con sus puntos de interés' })
  @ApiNotFoundResponse({ type: ErrorResponse, description: 'Evento no encontrado o no activo' })
  @Public()
  @Get(':uuid')
  async getEvent(@Param('uuid') uuid: string): Promise<EventResponse> {
    const entity = await this.eventsService.findOneByUuid(uuid);
    return EventMapper.toResponse(entity, true); // true para incluir POIs
  }

  @ApiOperation({ summary: 'Detalle de un evento finalizado por uuid' })
  @ApiParam({ name: 'uuid', description: 'UUID único del evento finalizado', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiOkResponse({ type: EventResponse, description: 'Detalle del evento finalizado' })
  @ApiNotFoundResponse({ type: ErrorResponse, description: 'Evento finalizado no encontrado' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Token inválido o no proporcionado' })
  @ApiForbiddenResponse({ type: ErrorResponse, description: 'Acceso denegado: se requiere rol admin' })
  @Get('finished/:uuid')
  async getFinishedEvent(@Param('uuid') uuid: string): Promise<EventResponse> {
    const entity = await this.eventsService.findFinishedByUuid(uuid);
    return EventMapper.toResponse(entity);
  }

  @ApiOperation({ summary: 'Crear un nuevo evento' })
  @ApiBody({ type: CreateEventRequest })
  @ApiCreatedResponse({ type: EventResponse, description: 'Evento creado exitosamente' })
  @ApiBadRequestResponse({ type: ErrorResponse, description: 'Datos inválidos' })
  @ApiNotFoundResponse({ type: ErrorResponse, description: 'Categoría no encontrada' })
  @ApiConflictResponse({ type: ErrorResponse, description: 'Conflict: uuid ya existe' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Token inválido o no proporcionado' })
  @ApiForbiddenResponse({ type: ErrorResponse, description: 'Acceso denegado: se requiere rol admin' })
  @Post()
  async createEvent(@Body() dto: CreateEventRequest): Promise<EventResponse> {
    const entity = await this.eventsService.createEvent(dto);
    return EventMapper.toResponse(entity);
  }

  @ApiOperation({ summary: 'Actualizar un evento por uuid' })
  @ApiParam({ name: 'uuid', description: 'UUID único del evento', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiBody({ type: UpdateEventRequest })
  @ApiOkResponse({ type: EventResponse, description: 'Evento actualizado exitosamente' })
  @ApiNotFoundResponse({ type: ErrorResponse, description: 'Evento no encontrado' })
  @ApiBadRequestResponse({ type: ErrorResponse, description: 'Datos inválidos' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Token inválido o no proporcionado' })
  @ApiForbiddenResponse({ type: ErrorResponse, description: 'Acceso denegado: se requiere rol admin' })
  @Patch(':uuid')
  async updateEvent(
    @Param('uuid') uuid: string, 
    @Body() dto: UpdateEventRequest
  ): Promise<EventResponse> {
    const entity = await this.eventsService.updateByUuid(uuid, dto);
    return EventMapper.toResponse(entity);
  }

  @ApiOperation({ summary: 'Eliminar un evento por uuid (soft delete)' })
  @ApiParam({ name: 'uuid', description: 'UUID único del evento', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiOkResponse({ description: 'Evento eliminado exitosamente' })
  @ApiNotFoundResponse({ type: ErrorResponse, description: 'Evento no encontrado' })
  @ApiBadRequestResponse({
    type: ErrorResponse,
    description: 'El evento existe pero su estado no permite eliminación (status != ACTIVE).',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Token inválido o no proporcionado' })
  @ApiForbiddenResponse({ type: ErrorResponse, description: 'Acceso denegado: se requiere rol admin' })
  @HttpCode(HttpStatus.OK)
  @Delete(':uuid')
  async deleteEvent(@Param('uuid') uuid: string): Promise<{ message: string }> {
    await this.eventsService.removeByUuid(uuid);
    return { message: 'Evento eliminado exitosamente' };
  }
}
