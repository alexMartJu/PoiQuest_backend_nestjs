import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  HttpCode, HttpStatus, UseGuards 
} from '@nestjs/common';
import { 
  ApiTags, ApiOperation, ApiOkResponse, ApiCreatedResponse, 
  ApiNotFoundResponse, ApiBadRequestResponse, ApiConflictResponse, 
  ApiParam, ApiBody, ApiBearerAuth, ApiUnauthorizedResponse, ApiForbiddenResponse
} from '@nestjs/swagger';
import { PointsOfInterestService } from '../../application/services/points-of-interest.service';
import { CreatePointOfInterestRequest } from '../dto/requests/create-point-of-interest.request.dto';
import { UpdatePointOfInterestRequest } from '../dto/requests/update-point-of-interest.request.dto';
import { PointOfInterestResponse } from '../dto/responses/point-of-interest.response.dto';
import { PointOfInterestMapper } from '../mappers/point-of-interest.mapper';
import { ErrorResponse } from '../../../shared/dto/error.response.dto';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { Public } from '../../../auth/infrastructure/decorators/public.decorator';

@ApiTags('points-of-interest')
@Controller('points-of-interest')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PointsOfInterestController {
  constructor(private readonly poisService: PointsOfInterestService) {}

  @ApiOperation({ summary: 'Lista de todos los POIs (admin)' })
  @ApiOkResponse({ type: PointOfInterestResponse, isArray: true, description: 'Lista de POIs' })
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Token inválido o no proporcionado' })
  @ApiForbiddenResponse({ type: ErrorResponse, description: 'Acceso denegado: se requiere rol admin' })
  @Roles('admin')
  @Get()
  async getPois(): Promise<PointOfInterestResponse[]> {
    const entities = await this.poisService.findAll();
    return PointOfInterestMapper.toResponseList(entities);
  }

  @ApiOperation({ summary: 'Detalle de un POI por uuid (público)' })
  @ApiParam({ name: 'uuid', description: 'UUID único del POI', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiOkResponse({ type: PointOfInterestResponse, description: 'Detalle del POI' })
  @ApiNotFoundResponse({ type: ErrorResponse, description: 'POI no encontrado' })
  @ApiBadRequestResponse({ type: ErrorResponse, description: 'UUID inválido' })
  @Public()
  @Get(':uuid')
  async getPoi(@Param('uuid') uuid: string): Promise<PointOfInterestResponse> {
    const entity = await this.poisService.findOneByUuid(uuid);
    return PointOfInterestMapper.toResponse(entity);
  }

  @ApiOperation({ summary: 'Crear un nuevo POI (admin)' })
  @ApiBody({ type: CreatePointOfInterestRequest })
  @ApiCreatedResponse({ type: PointOfInterestResponse, description: 'POI creado exitosamente' })
  @ApiBadRequestResponse({ type: ErrorResponse, description: 'Datos inválidos' })
  @ApiConflictResponse({ type: ErrorResponse, description: 'Conflict: QR Code o NFC Tag ya existe' })
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Token inválido o no proporcionado' })
  @ApiForbiddenResponse({ type: ErrorResponse, description: 'Acceso denegado: se requiere rol admin' })
  @Roles('admin')
  @Post()
  async createPoi(@Body() dto: CreatePointOfInterestRequest): Promise<PointOfInterestResponse> {
    const entity = await this.poisService.createPoi(dto);
    return PointOfInterestMapper.toResponse(entity);
  }

  @ApiOperation({ summary: 'Actualizar un POI por uuid (admin)' })
  @ApiParam({ name: 'uuid', description: 'UUID único del POI', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiBody({ type: UpdatePointOfInterestRequest })
  @ApiOkResponse({ type: PointOfInterestResponse, description: 'POI actualizado exitosamente' })
  @ApiNotFoundResponse({ type: ErrorResponse, description: 'POI no encontrado' })
  @ApiBadRequestResponse({ type: ErrorResponse, description: 'Datos inválidos' })
  @ApiConflictResponse({ type: ErrorResponse, description: 'Conflict: QR Code o NFC Tag ya existe' })
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Token inválido o no proporcionado' })
  @ApiForbiddenResponse({ type: ErrorResponse, description: 'Acceso denegado: se requiere rol admin' })
  @Roles('admin')
  @Patch(':uuid')
  async updatePoi(
    @Param('uuid') uuid: string, 
    @Body() dto: UpdatePointOfInterestRequest
  ): Promise<PointOfInterestResponse> {
    const entity = await this.poisService.updateByUuid(uuid, dto);
    return PointOfInterestMapper.toResponse(entity);
  }

  @ApiOperation({ summary: 'Eliminar un POI por uuid (soft delete) (admin)' })
  @ApiParam({ name: 'uuid', description: 'UUID único del POI', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiOkResponse({ description: 'POI eliminado exitosamente' })
  @ApiNotFoundResponse({ type: ErrorResponse, description: 'POI no encontrado' })
  @ApiBadRequestResponse({ type: ErrorResponse, description: 'El POI ya fue eliminado' })
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Token inválido o no proporcionado' })
  @ApiForbiddenResponse({ type: ErrorResponse, description: 'Acceso denegado: se requiere rol admin' })
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @Delete(':uuid')
  async deletePoi(@Param('uuid') uuid: string): Promise<{ message: string }> {
    await this.poisService.removeByUuid(uuid);
    return { message: 'POI eliminado exitosamente' };
  }
}
