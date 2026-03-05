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
import { SponsorsService } from '../../application/services/sponsors.service';
import { CreateSponsorRequest } from '../dto/requests/create-sponsor.request.dto';
import { UpdateSponsorRequest } from '../dto/requests/update-sponsor.request.dto';
import { PartnerCursorPaginationRequest } from '../dto/requests/partner-cursor-pagination.request.dto';
import { SponsorResponse } from '../dto/responses/sponsor.response.dto';
import { PaginatedSponsorsResponse } from '../dto/responses/paginated-sponsors.response.dto';
import { SponsorMapper } from '../mappers/sponsor.mapper';
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

@ApiTags('sponsors')
@Controller('sponsors')
export class SponsorsController {
  constructor(
    private readonly sponsorsService: SponsorsService,
    private readonly imagesService: ImagesService,
    private readonly filesService: FilesService,
  ) {}

  @ApiOperation({
    summary: 'Lista patrocinadores con paginación basada en cursor',
    description:
      'Devuelve patrocinadores paginados ordenados por fecha de creación ascendente. Por defecto muestra los activos. Usa el parámetro status para filtrar.',
  })
  @ApiOkResponse({ type: PaginatedSponsorsResponse, description: 'Lista paginada de patrocinadores' })
  @ApiQuery({ name: 'cursor', required: false, type: String, description: 'Cursor ISO 8601 para paginación', example: '2025-03-09T12:34:56.000Z' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Número máximo de items por página. Default 10', example: 10 })
  @ApiQuery({ name: 'status', required: false, enum: PartnerStatus, description: 'Filtrar por estado. Si no se indica, se devuelven los activos.' })
  @ApiInternalServerErrorResponse({ type: ErrorResponse, description: 'Error interno del servidor' })
  @Public()
  @Get()
  async getSponsors(@Query() pagination: PartnerCursorPaginationRequest): Promise<PaginatedSponsorsResponse> {
    const query = { ...pagination, status: pagination.status ?? PartnerStatus.ACTIVE };
    const result = await this.sponsorsService.findAllWithCursor(query);

    const ids = result.data.map(s => s.id);
    const allImages = await this.imagesService.fetchImagesByIds(ImageableType.SPONSOR, ids);
    const imagesMap = buildImagesMap(allImages);
    const presignedMap = await PresignedUrlHelper.generatePresignedUrlsForMap(imagesMap, this.filesService);

    return {
      data: SponsorMapper.toResponseList(result.data, imagesMap, presignedMap),
      nextCursor: result.nextCursor,
      hasNextPage: result.hasNextPage,
    };
  }

  @ApiOperation({ summary: 'Detalle de un patrocinador por uuid' })
  @ApiParam({ name: 'uuid', description: 'UUID único del patrocinador', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiOkResponse({ type: SponsorResponse, description: 'Detalle del patrocinador' })
  @ApiNotFoundResponse({ type: ErrorResponse, description: 'Patrocinador no encontrado' })
  @Public()
  @Get(':uuid')
  async getSponsor(@Param('uuid') uuid: string): Promise<SponsorResponse> {
    const entity = await this.sponsorsService.findOneByUuid(uuid);
    const images = await this.imagesService.fetchImages(ImageableType.SPONSOR, entity.id);
    const presignedMap = await PresignedUrlHelper.generatePresignedUrls(images, this.filesService);
    return SponsorMapper.toResponse(entity, images, presignedMap);
  }

  @ApiOperation({ summary: 'Crear un nuevo patrocinador (admin)' })
  @ApiBody({ type: CreateSponsorRequest })
  @ApiCreatedResponse({ type: SponsorResponse, description: 'Patrocinador creado exitosamente' })
  @ApiBadRequestResponse({ type: ErrorResponse, description: 'Datos inválidos' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Token inválido o no proporcionado' })
  @ApiForbiddenResponse({ type: ErrorResponse, description: 'Acceso denegado: se requiere rol admin' })
  @Post()
  async createSponsor(@Body() dto: CreateSponsorRequest): Promise<SponsorResponse> {
    const entity = await this.sponsorsService.createSponsor(dto);
    const images = await this.imagesService.fetchImages(ImageableType.SPONSOR, entity.id);
    const presignedMap = await PresignedUrlHelper.generatePresignedUrls(images, this.filesService);
    return SponsorMapper.toResponse(entity, images, presignedMap);
  }

  @ApiOperation({ summary: 'Actualizar un patrocinador por uuid (admin)' })
  @ApiParam({ name: 'uuid', description: 'UUID único del patrocinador', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiBody({ type: UpdateSponsorRequest })
  @ApiOkResponse({ type: SponsorResponse, description: 'Patrocinador actualizado exitosamente' })
  @ApiNotFoundResponse({ type: ErrorResponse, description: 'Patrocinador no encontrado' })
  @ApiBadRequestResponse({ type: ErrorResponse, description: 'Datos inválidos' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Token inválido o no proporcionado' })
  @ApiForbiddenResponse({ type: ErrorResponse, description: 'Acceso denegado: se requiere rol admin' })
  @Patch(':uuid')
  async updateSponsor(
    @Param('uuid') uuid: string,
    @Body() dto: UpdateSponsorRequest,
  ): Promise<SponsorResponse> {
    const entity = await this.sponsorsService.updateByUuid(uuid, dto);
    const images = await this.imagesService.fetchImages(ImageableType.SPONSOR, entity.id);
    const presignedMap = await PresignedUrlHelper.generatePresignedUrls(images, this.filesService);
    return SponsorMapper.toResponse(entity, images, presignedMap);
  }

  @ApiOperation({
    summary: 'Deshabilitar un patrocinador por uuid (soft delete) (admin)',
    description: 'Cambia el estado del patrocinador a DISABLED. No se permite si tiene eventos activos asociados.',
  })
  @ApiParam({ name: 'uuid', description: 'UUID único del patrocinador', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiOkResponse({ description: 'Patrocinador deshabilitado exitosamente' })
  @ApiNotFoundResponse({ type: ErrorResponse, description: 'Patrocinador no encontrado' })
  @ApiBadRequestResponse({ type: ErrorResponse, description: 'No se puede deshabilitar: tiene eventos activos o ya está deshabilitado' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Token inválido o no proporcionado' })
  @ApiForbiddenResponse({ type: ErrorResponse, description: 'Acceso denegado: se requiere rol admin' })
  @HttpCode(HttpStatus.OK)
  @Delete(':uuid')
  async disableSponsor(@Param('uuid') uuid: string): Promise<{ message: string }> {
    await this.sponsorsService.disableByUuid(uuid);
    return { message: 'Patrocinador deshabilitado correctamente' };
  }
}
