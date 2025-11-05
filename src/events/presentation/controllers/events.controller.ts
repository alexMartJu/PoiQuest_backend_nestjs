import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  HttpCode, HttpStatus 
} from '@nestjs/common';
import { EventsService } from '../../application/services/events.service';
import { CreateEventRequest } from '../dto/requests/create-event.request.dto';
import { UpdateEventRequest } from '../dto/requests/update-event.request.dto';
import { EventResponse } from '../dto/responses/event.response.dto';
import { EventMapper } from '../mappers/event.mapper';
import { 
  ApiTags, ApiOperation, ApiOkResponse, ApiCreatedResponse, 
  ApiNotFoundResponse, ApiBadRequestResponse, ApiConflictResponse, ApiBody, ApiParam 
} from '@nestjs/swagger';
import { ErrorResponse } from '../../../shared/dto/error.response.dto';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @ApiOperation({ summary: 'Lista de todos los eventos' })
  @ApiOkResponse({ type: EventResponse, isArray: true, description: 'Lista de eventos' })
  @Get()
  async getEvents(): Promise<EventResponse[]> {
    const entities = await this.eventsService.findAll();
    return EventMapper.toResponseList(entities);
  }

  @ApiOperation({ summary: 'Detalle de un evento por uuid' })
  @ApiParam({ name: 'uuid', description: 'UUID único del evento', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiOkResponse({ type: EventResponse, description: 'Detalle del evento' })
  @ApiNotFoundResponse({ type: ErrorResponse, description: 'Evento no encontrado' })
  @Get(':uuid')
  async getEvent(@Param('uuid') uuid: string): Promise<EventResponse> {
    const entity = await this.eventsService.findOneByUuid(uuid);
    return EventMapper.toResponse(entity);
  }

  @ApiOperation({ summary: 'Crear un nuevo evento' })
  @ApiBody({ type: CreateEventRequest })
  @ApiCreatedResponse({ type: EventResponse, description: 'Evento creado exitosamente' })
  @ApiBadRequestResponse({ type: ErrorResponse, description: 'Datos inválidos' })
  @ApiConflictResponse({ type: ErrorResponse, description: 'Conflict: uuid ya existe' })
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
  @HttpCode(HttpStatus.OK)
  @Delete(':uuid')
  async deleteEvent(@Param('uuid') uuid: string): Promise<{ message: string }> {
    await this.eventsService.removeByUuid(uuid);
    return { message: 'Evento eliminado exitosamente' };
  }
}
