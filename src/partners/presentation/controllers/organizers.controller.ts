import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  HttpCode, HttpStatus, UseGuards, Query,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiOkResponse, ApiCreatedResponse,
  ApiNotFoundResponse, ApiBadRequestResponse, ApiConflictResponse,
  ApiParam, ApiBody, ApiBearerAuth, ApiUnauthorizedResponse,
  ApiForbiddenResponse, ApiQuery, ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { OrganizersService } from '../../application/services/organizers.service';
import { CreateOrganizerRequest } from '../dto/requests/create-organizer.request.dto';
import { UpdateOrganizerRequest } from '../dto/requests/update-organizer.request.dto';
import { PartnerCursorPaginationRequest } from '../dto/requests/partner-cursor-pagination.request.dto';
import { OrganizerResponse } from '../dto/responses/organizer.response.dto';
import { PaginatedOrganizersResponse } from '../dto/responses/paginated-organizers.response.dto';
import { OrganizerMapper } from '../mappers/organizer.mapper';
import { ImagesService } from '../../../media/application/services/images.service';
import { FilesService } from '../../../media/application/services/files.service';
import { ImageableType } from '../../../media/domain/enums/imageable-type.enum';
import { buildImagesMap } from '../helpers/images-map.helper';
import { PresignedUrlHelper } from '../helpers/presigned-url.helper';
import { ErrorResponse } from '../../../shared/dto/error.response.dto';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { Public } from '../../../auth/infrastructure/decorators/public.decorator';
import { PartnerStatus } from '../../domain/enums/partner-status.enum';

@ApiTags('organizers')
@Controller('organizers')
export class OrganizersController {
  constructor(
    private readonly organizersService: OrganizersService,
    private readonly imagesService: ImagesService,
    private readonly filesService: FilesService,
  ) {}

  @ApiOperation({
    summary: 'Lista organizadores con paginación basada en cursor',
    description:
      'Devuelve organizadores paginados ordenados por fecha de creación ascendente. Por defecto muestra los activos. Usa el parámetro status para filtrar.',
  })
  @ApiOkResponse({ type: PaginatedOrganizersResponse, description: 'Lista paginada de organizadores' })
  @ApiQuery({ name: 'cursor', required: false, type: String, description: 'Cursor ISO 8601 para paginación', example: '2025-03-09T12:34:56.000Z' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Número máximo de items por página. Default 10', example: 10 })
  @ApiQuery({ name: 'status', required: false, enum: PartnerStatus, description: 'Filtrar por estado. Si no se indica, se devuelven los activos.' })
  @ApiInternalServerErrorResponse({ type: ErrorResponse, description: 'Error interno del servidor' })
  @Public()
  @Get()
  async getOrganizers(@Query() pagination: PartnerCursorPaginationRequest): Promise<PaginatedOrganizersResponse> {
    const query = { ...pagination, status: pagination.status ?? PartnerStatus.ACTIVE };
    const result = await this.organizersService.findAllWithCursor(query);

    const ids = result.data.map(o => o.id);
    const allImages = await this.imagesService.fetchImagesByIds(ImageableType.ORGANIZER, ids);
    const imagesMap = buildImagesMap(allImages);
    const presignedMap = await PresignedUrlHelper.generatePresignedUrlsForMap(imagesMap, this.filesService);

    return {
      data: OrganizerMapper.toResponseList(result.data, imagesMap, presignedMap),
      nextCursor: result.nextCursor,
      hasNextPage: result.hasNextPage,
    };
  }

  @ApiOperation({ summary: 'Detalle de un organizador por uuid' })
  @ApiParam({ name: 'uuid', description: 'UUID único del organizador', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiOkResponse({ type: OrganizerResponse, description: 'Detalle del organizador' })
  @ApiNotFoundResponse({ type: ErrorResponse, description: 'Organizador no encontrado' })
  @Public()
  @Get(':uuid')
  async getOrganizer(@Param('uuid') uuid: string): Promise<OrganizerResponse> {
    const entity = await this.organizersService.findOneByUuid(uuid);
    const images = await this.imagesService.fetchImages(ImageableType.ORGANIZER, entity.id);
    const presignedMap = await PresignedUrlHelper.generatePresignedUrls(images, this.filesService);
    return OrganizerMapper.toResponse(entity, images, presignedMap);
  }

  @ApiOperation({ summary: 'Crear un nuevo organizador (admin)' })
  @ApiBody({ type: CreateOrganizerRequest })
  @ApiCreatedResponse({ type: OrganizerResponse, description: 'Organizador creado exitosamente' })
  @ApiBadRequestResponse({ type: ErrorResponse, description: 'Datos inválidos' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Token inválido o no proporcionado' })
  @ApiForbiddenResponse({ type: ErrorResponse, description: 'Acceso denegado: se requiere rol admin' })
  @Post()
  async createOrganizer(@Body() dto: CreateOrganizerRequest): Promise<OrganizerResponse> {
    const entity = await this.organizersService.createOrganizer(dto);
    const images = await this.imagesService.fetchImages(ImageableType.ORGANIZER, entity.id);
    const presignedMap = await PresignedUrlHelper.generatePresignedUrls(images, this.filesService);
    return OrganizerMapper.toResponse(entity, images, presignedMap);
  }

  @ApiOperation({ summary: 'Actualizar un organizador por uuid (admin)' })
  @ApiParam({ name: 'uuid', description: 'UUID único del organizador', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiBody({ type: UpdateOrganizerRequest })
  @ApiOkResponse({ type: OrganizerResponse, description: 'Organizador actualizado exitosamente' })
  @ApiNotFoundResponse({ type: ErrorResponse, description: 'Organizador no encontrado' })
  @ApiBadRequestResponse({ type: ErrorResponse, description: 'Datos inválidos' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Token inválido o no proporcionado' })
  @ApiForbiddenResponse({ type: ErrorResponse, description: 'Acceso denegado: se requiere rol admin' })
  @Patch(':uuid')
  async updateOrganizer(
    @Param('uuid') uuid: string,
    @Body() dto: UpdateOrganizerRequest,
  ): Promise<OrganizerResponse> {
    const entity = await this.organizersService.updateByUuid(uuid, dto);
    const images = await this.imagesService.fetchImages(ImageableType.ORGANIZER, entity.id);
    const presignedMap = await PresignedUrlHelper.generatePresignedUrls(images, this.filesService);
    return OrganizerMapper.toResponse(entity, images, presignedMap);
  }

  @ApiOperation({
    summary: 'Deshabilitar un organizador por uuid (soft delete) (admin)',
    description: 'Cambia el estado del organizador a DISABLED. No se permite si tiene eventos activos asociados.',
  })
  @ApiParam({ name: 'uuid', description: 'UUID único del organizador', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiOkResponse({ description: 'Organizador deshabilitado exitosamente' })
  @ApiNotFoundResponse({ type: ErrorResponse, description: 'Organizador no encontrado' })
  @ApiBadRequestResponse({ type: ErrorResponse, description: 'No se puede deshabilitar: tiene eventos activos o ya está deshabilitado' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Token inválido o no proporcionado' })
  @ApiForbiddenResponse({ type: ErrorResponse, description: 'Acceso denegado: se requiere rol admin' })
  @HttpCode(HttpStatus.OK)
  @Delete(':uuid')
  async disableOrganizer(@Param('uuid') uuid: string): Promise<{ message: string }> {
    await this.organizersService.disableByUuid(uuid);
    return { message: 'Organizador deshabilitado correctamente' };
  }
}
