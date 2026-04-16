import {
  Controller, Get, Post, Body, Param, Query,
  HttpCode, HttpStatus, UseGuards,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiOkResponse, ApiBearerAuth,
  ApiBadRequestResponse, ApiNotFoundResponse,
  ApiUnauthorizedResponse, ApiInternalServerErrorResponse,
  ApiBody, ApiQuery,
} from '@nestjs/swagger';
import { ExploreService } from '../../application/services/explore.service';
import { FilesService } from '../../../media/application/services/files.service';
import { ScanPoiRequest } from '../dto/requests/scan-poi.request.dto';
import { GetMyEventsRequest } from '../dto/requests/get-my-events.request.dto';
import { PaginatedExploreEventsResponse } from '../dto/responses/explore-event.response.dto';
import { EventProgressResponse } from '../dto/responses/event-progress.response.dto';
import { ScanResultResponse } from '../dto/responses/scan-result.response.dto';
import { RouteNavigationResponse } from '../dto/responses/route-navigation.response.dto';
import { ExploreEventMapper } from '../mappers/explore-event.mapper';
import { EventProgressMapper } from '../mappers/event-progress.mapper';
import { ScanResultMapper } from '../mappers/scan-result.mapper';
import { RouteNavigationMapper } from '../mappers/route-navigation.mapper';
import { PresignedUrlHelper } from '../../../events/presentation/helpers/presigned-url.helper';
import { ImageEntity } from '../../../media/domain/entities/image.entity';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/infrastructure/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../../auth/presentation/types/current-user-payload';
import { ErrorResponse } from '../../../shared/dto/error.response.dto';

@ApiTags('explore')
@Controller('explore')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExploreController {
  constructor(
    private readonly exploreService: ExploreService,
    private readonly filesService: FilesService,
  ) {}

  @ApiOperation({
    summary: 'Obtener eventos del usuario para explorar',
    description: 'Devuelve eventos paginados del usuario a partir de sus tickets activos o usados, con progreso de POIs.',
  })
  @ApiQuery({ name: 'status', required: true, enum: ['active', 'used'], description: 'Estado de los tickets' })
  @ApiQuery({ name: 'cursor', required: false, type: String, description: 'Cursor para paginación' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Elementos por página (default: 4)' })
  @ApiOkResponse({ type: PaginatedExploreEventsResponse, description: 'Eventos paginados con progreso' })
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Token inválido o no proporcionado' })
  @ApiInternalServerErrorResponse({ type: ErrorResponse, description: 'Error interno' })
  @Get('my-events')
  async getMyEvents(
    @CurrentUser() user: CurrentUserPayload,
    @Query() query: GetMyEventsRequest,
  ): Promise<PaginatedExploreEventsResponse> {
    const result = await this.exploreService.getMyEvents(
      user.userId,
      query.status,
      query.cursor,
      query.limit ?? 4,
    );

    const images = result.data
      .map(d => d.primaryImage)
      .filter((img): img is ImageEntity => img !== null);
    const presignedUrlsMap = await PresignedUrlHelper.generatePresignedUrls(images, this.filesService);

    return ExploreEventMapper.toPaginatedResponse(result, presignedUrlsMap);
  }

  @ApiOperation({
    summary: 'Obtener progreso detallado de un evento',
    description: 'Devuelve el progreso de POIs y rutas para un evento y fecha de visita específicos.',
  })
  @ApiQuery({ name: 'visitDate', required: true, type: String, description: 'Fecha de visita (YYYY-MM-DD)' })
  @ApiOkResponse({ type: EventProgressResponse, description: 'Progreso detallado del evento' })
  @ApiNotFoundResponse({ type: ErrorResponse, description: 'Ticket o evento no encontrado' })
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Token inválido o no proporcionado' })
  @ApiInternalServerErrorResponse({ type: ErrorResponse, description: 'Error interno' })
  @Get('events/:eventUuid/progress')
  async getEventProgress(
    @CurrentUser() user: CurrentUserPayload,
    @Param('eventUuid') eventUuid: string,
    @Query('visitDate') visitDate: string,
  ): Promise<EventProgressResponse> {
    const result = await this.exploreService.getEventProgress(user.userId, eventUuid, visitDate);

    const presignedUrlsMap = result.primaryImage
      ? await PresignedUrlHelper.generatePresignedUrls([result.primaryImage], this.filesService)
      : new Map<number, string>();

    return EventProgressMapper.toResponse(result, presignedUrlsMap);
  }

  @ApiOperation({
    summary: 'Escanear un punto de interés',
    description: 'Registra el escaneo de un POI para un ticket. Solo permitido en la fecha de visita con ticket validado.',
  })
  @ApiBody({ type: ScanPoiRequest })
  @ApiOkResponse({ type: ScanResultResponse, description: 'POI escaneado correctamente' })
  @ApiBadRequestResponse({ type: ErrorResponse, description: 'Validación fallida' })
  @ApiNotFoundResponse({ type: ErrorResponse, description: 'POI o ticket no encontrado' })
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Token inválido o no proporcionado' })
  @ApiInternalServerErrorResponse({ type: ErrorResponse, description: 'Error interno' })
  @HttpCode(HttpStatus.OK)
  @Post('scan-poi')
  async scanPoi(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: ScanPoiRequest,
  ): Promise<ScanResultResponse> {
    const result = await this.exploreService.scanPoi(user.userId, dto);

    const modelUrl = await PresignedUrlHelper.generateModelUrl(
      result.poi.modelFileName ?? null,
      'models',
      this.filesService,
      3600,
    );

    return ScanResultMapper.toResponse(result, modelUrl);
  }

  @ApiOperation({
    summary: 'Obtener datos de navegación de una ruta',
    description: 'Devuelve los POIs de una ruta con coordenadas y estado de escaneo para navegación en mapa.',
  })
  @ApiQuery({ name: 'ticketUuid', required: true, type: String, description: 'UUID del ticket' })
  @ApiOkResponse({ type: RouteNavigationResponse, description: 'Datos de navegación de la ruta' })
  @ApiNotFoundResponse({ type: ErrorResponse, description: 'Ruta o ticket no encontrado' })
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Token inválido o no proporcionado' })
  @ApiInternalServerErrorResponse({ type: ErrorResponse, description: 'Error interno' })
  @Get('routes/:routeUuid/navigation')
  async getRouteNavigation(
    @CurrentUser() user: CurrentUserPayload,
    @Param('routeUuid') routeUuid: string,
    @Query('ticketUuid') ticketUuid: string,
  ): Promise<RouteNavigationResponse> {
    const result = await this.exploreService.getRouteNavigation(user.userId, routeUuid, ticketUuid);
    return RouteNavigationMapper.toResponse(result);
  }
}
