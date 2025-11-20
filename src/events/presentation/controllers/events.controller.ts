import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  HttpCode, HttpStatus, UseGuards, Query
} from '@nestjs/common';
import { EventsService } from '../../application/services/events.service';
import { CreateEventRequest } from '../dto/requests/create-event.request.dto';
import { UpdateEventRequest } from '../dto/requests/update-event.request.dto';
import { CursorPaginationRequest } from '../dto/requests/cursor-pagination.request.dto';
import { EventResponse } from '../dto/responses/event.response.dto';
import { PaginatedEventsResponse } from '../dto/responses/paginated-events.response.dto';
import { EventMapper } from '../mappers/event.mapper';
import { ImagesService } from '../../../media/application/services/images.service';
import { ImageableType } from '../../../media/domain/enums/imageable-type.enum';
import { buildImagesMap } from '../helpers/images-map.helper';
import { 
  ApiTags, ApiOperation, ApiOkResponse, ApiCreatedResponse, 
  ApiNotFoundResponse, ApiBadRequestResponse, ApiConflictResponse, ApiBody, ApiParam, ApiQuery,
  ApiBearerAuth, ApiUnauthorizedResponse, ApiForbiddenResponse, ApiInternalServerErrorResponse
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { Public } from '../../../auth/infrastructure/decorators/public.decorator';
import { ErrorResponse } from '../../../shared/dto/error.response.dto';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly imagesService: ImagesService,
  ) {}

  @ApiOperation({ 
    summary: 'Lista de eventos activos de una categoría con paginación basada en cursor',
    description: 'Obtiene eventos activos filtrados por categoría usando paginación basada en cursor (createdAt). Devuelve eventos ordenados del más antiguo al más reciente.'
  })
  @ApiParam({ 
    name: 'categoryUuid', 
    description: 'UUID de la categoría para filtrar eventos', 
    example: '550e8400-e29b-41d4-a716-446655440000' 
  })
  @ApiOkResponse({ type: PaginatedEventsResponse, description: 'Lista paginada de eventos activos de la categoría' })
  @ApiNotFoundResponse({ type: ErrorResponse, description: 'Categoría no encontrada' })
  @ApiBadRequestResponse({ type: ErrorResponse, description: 'Parámetros de paginación inválidos' })
  @ApiQuery({ name: 'cursor', required: false, type: String, description: 'Cursor ISO 8601 para paginación (createdAt). Usar el valor devuelto en nextCursor para continuar.', example: '2025-03-09T12:34:56.000Z' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Número máximo de items por página. Default 3', example: 3 })
  @ApiInternalServerErrorResponse({ type: ErrorResponse, description: 'Error interno del servidor' })
  @Public()
  @Get('category/:categoryUuid')
  async getEventsByCategory(
    @Param('categoryUuid') categoryUuid: string,
    @Query() pagination: CursorPaginationRequest,
  ): Promise<PaginatedEventsResponse> {
    const result = await this.eventsService.findByCategoryWithCursor(categoryUuid, pagination);
    
    // Cargar imágenes para todos los eventos en una sola consulta (evita N+1)
    const eventIds = result.data.map(e => e.id);
    const allImages = await this.imagesService.fetchImagesByIds(ImageableType.EVENT, eventIds);
    const imagesMap = buildImagesMap(allImages);
    
    return {
      data: EventMapper.toResponseList(result.data, false, imagesMap),
      nextCursor: result.nextCursor,
      hasNextPage: result.hasNextPage,
    };
  }

  @ApiOperation({ summary: 'Lista de todos los eventos activos (paginación por cursor)' })
  @ApiOkResponse({ type: PaginatedEventsResponse, description: 'Lista paginada de eventos activos' })
  @ApiQuery({ name: 'cursor', required: false, type: String, description: 'Cursor ISO 8601 para paginación (createdAt). Usar el valor devuelto en nextCursor para continuar.', example: '2025-03-09T12:34:56.000Z' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Número máximo de items por página. Default 3', example: 3 })
  @Public()
  @Get()
  async getEvents(@Query() pagination: CursorPaginationRequest): Promise<PaginatedEventsResponse> {
    const result = await this.eventsService.findAllWithCursor(pagination);

    // Cargar imágenes para todos los eventos en una sola consulta (evita N+1)
    const eventIds = result.data.map(e => e.id);
    const allImages = await this.imagesService.fetchImagesByIds(ImageableType.EVENT, eventIds);
    const imagesMap = buildImagesMap(allImages);

    return {
      data: EventMapper.toResponseList(result.data, false, imagesMap),
      nextCursor: result.nextCursor,
      hasNextPage: result.hasNextPage,
    };
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
    // Cargar imágenes para todos los eventos finalizados en una sola consulta (evita N+1)
    const eventIds = entities.map(e => e.id);
    const allImages = await this.imagesService.fetchImagesByIds(ImageableType.EVENT, eventIds);
    const imagesMap = buildImagesMap(allImages);
    return EventMapper.toResponseList(entities, false, imagesMap);
  }

  @ApiOperation({ summary: 'Detalle de un evento activo por uuid (incluye POIs)' })
  @ApiParam({ name: 'uuid', description: 'UUID único del evento activo', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiOkResponse({ type: EventResponse, description: 'Detalle del evento activo con sus puntos de interés' })
  @ApiNotFoundResponse({ type: ErrorResponse, description: 'Evento no encontrado o no activo' })
  @Public()
  @Get(':uuid')
  async getEvent(@Param('uuid') uuid: string): Promise<EventResponse> {
    const entity = await this.eventsService.findOneByUuid(uuid);
    const images = await this.imagesService.fetchImages(ImageableType.EVENT, entity.id);
    return EventMapper.toResponse(entity, true, images); // true para incluir POIs
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
    const images = await this.imagesService.fetchImages(ImageableType.EVENT, entity.id);
    return EventMapper.toResponse(entity, false, images);
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
    const images = await this.imagesService.fetchImages(ImageableType.EVENT, entity.id);
    return EventMapper.toResponse(entity, false, images);
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
    const images = await this.imagesService.fetchImages(ImageableType.EVENT, entity.id);
    return EventMapper.toResponse(entity, false, images);
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
