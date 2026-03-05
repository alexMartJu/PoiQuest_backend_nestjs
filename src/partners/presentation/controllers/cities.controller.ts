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
import { CitiesService } from '../../application/services/cities.service';
import { CreateCityRequest } from '../dto/requests/create-city.request.dto';
import { UpdateCityRequest } from '../dto/requests/update-city.request.dto';
import { PartnerCursorPaginationRequest } from '../dto/requests/partner-cursor-pagination.request.dto';
import { CityResponse } from '../dto/responses/city.response.dto';
import { PaginatedCitiesResponse } from '../dto/responses/paginated-cities.response.dto';
import { CityMapper } from '../mappers/city.mapper';
import { ErrorResponse } from '../../../shared/dto/error.response.dto';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { Public } from '../../../auth/infrastructure/decorators/public.decorator';
import { PartnerStatus } from '../../domain/enums/partner-status.enum';

@ApiTags('cities')
@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @ApiOperation({
    summary: 'Lista ciudades con paginación basada en cursor',
    description:
      'Devuelve ciudades paginadas ordenadas por fecha de creación ascendente. Por defecto muestra las ciudades activas. Usa el parámetro status para filtrar por estado.',
  })
  @ApiOkResponse({ type: PaginatedCitiesResponse, description: 'Lista paginada de ciudades' })
  @ApiQuery({ name: 'cursor', required: false, type: String, description: 'Cursor ISO 8601 para paginación', example: '2025-03-09T12:34:56.000Z' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Número máximo de items por página. Default 10', example: 10 })
  @ApiQuery({ name: 'status', required: false, enum: PartnerStatus, description: 'Filtrar por estado. Si no se indica, se devuelven las ciudades activas.' })
  @ApiInternalServerErrorResponse({ type: ErrorResponse, description: 'Error interno del servidor' })
  @Public()
  @Get()
  async getCities(@Query() pagination: PartnerCursorPaginationRequest): Promise<PaginatedCitiesResponse> {
    // Si no se especifica status, mostrar solo las activas al público
    const query = { ...pagination, status: pagination.status ?? PartnerStatus.ACTIVE };
    const result = await this.citiesService.findAllWithCursor(query);
    return {
      data: CityMapper.toResponseList(result.data),
      nextCursor: result.nextCursor,
      hasNextPage: result.hasNextPage,
    };
  }

  @ApiOperation({ summary: 'Detalle de una ciudad por uuid' })
  @ApiParam({ name: 'uuid', description: 'UUID único de la ciudad', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiOkResponse({ type: CityResponse, description: 'Detalle de la ciudad' })
  @ApiNotFoundResponse({ type: ErrorResponse, description: 'Ciudad no encontrada' })
  @Public()
  @Get(':uuid')
  async getCity(@Param('uuid') uuid: string): Promise<CityResponse> {
    const city = await this.citiesService.findOneByUuid(uuid);
    return CityMapper.toResponse(city)!;
  }

  @ApiOperation({ summary: 'Crear una nueva ciudad (admin)' })
  @ApiBody({ type: CreateCityRequest })
  @ApiCreatedResponse({ type: CityResponse, description: 'Ciudad creada exitosamente' })
  @ApiBadRequestResponse({ type: ErrorResponse, description: 'Datos inválidos' })
  @ApiConflictResponse({ type: ErrorResponse, description: 'Ya existe una ciudad con ese nombre y país' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Token inválido o no proporcionado' })
  @ApiForbiddenResponse({ type: ErrorResponse, description: 'Acceso denegado: se requiere rol admin' })
  @Post()
  async createCity(@Body() dto: CreateCityRequest): Promise<CityResponse> {
    const city = await this.citiesService.createCity(dto);
    return CityMapper.toResponse(city)!;
  }

  @ApiOperation({ summary: 'Actualizar una ciudad por uuid (admin)' })
  @ApiParam({ name: 'uuid', description: 'UUID único de la ciudad', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiBody({ type: UpdateCityRequest })
  @ApiOkResponse({ type: CityResponse, description: 'Ciudad actualizada exitosamente' })
  @ApiNotFoundResponse({ type: ErrorResponse, description: 'Ciudad no encontrada' })
  @ApiBadRequestResponse({ type: ErrorResponse, description: 'Datos inválidos' })
  @ApiConflictResponse({ type: ErrorResponse, description: 'Conflicto: nombre/país ya existe' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Token inválido o no proporcionado' })
  @ApiForbiddenResponse({ type: ErrorResponse, description: 'Acceso denegado: se requiere rol admin' })
  @Patch(':uuid')
  async updateCity(
    @Param('uuid') uuid: string,
    @Body() dto: UpdateCityRequest,
  ): Promise<CityResponse> {
    const city = await this.citiesService.updateByUuid(uuid, dto);
    return CityMapper.toResponse(city)!;
  }

  @ApiOperation({
    summary: 'Deshabilitar una ciudad por uuid (soft delete) (admin)',
    description: 'Cambia el estado de la ciudad a DISABLED. No se permite si hay eventos activos asociados.',
  })
  @ApiParam({ name: 'uuid', description: 'UUID único de la ciudad', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiOkResponse({ description: 'Ciudad deshabilitada exitosamente' })
  @ApiNotFoundResponse({ type: ErrorResponse, description: 'Ciudad no encontrada' })
  @ApiBadRequestResponse({ type: ErrorResponse, description: 'No se puede deshabilitar: tiene eventos activos asociados o ya está deshabilitada' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Token inválido o no proporcionado' })
  @ApiForbiddenResponse({ type: ErrorResponse, description: 'Acceso denegado: se requiere rol admin' })
  @HttpCode(HttpStatus.OK)
  @Delete(':uuid')
  async disableCity(@Param('uuid') uuid: string): Promise<{ message: string }> {
    await this.citiesService.disableByUuid(uuid);
    return { message: 'Ciudad deshabilitada correctamente' };
  }
}
