import { Controller, Get, Post, Patch, Delete, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiBadRequestResponse, ApiConflictResponse, ApiParam, ApiBody, ApiBearerAuth, ApiUnauthorizedResponse, ApiForbiddenResponse } from '@nestjs/swagger';
import { LevelsService } from '../../application/services/levels.service';
import { CreateLevelRequest } from '../dto/requests/create-level.request.dto';
import { UpdateLevelRequest } from '../dto/requests/update-level.request.dto';
import { LevelResponse } from '../dto/responses/level.response.dto';
import { LevelMapper } from '../mappers/level.mapper';
import { ErrorResponse } from '../../../shared/dto/error.response.dto';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';

@ApiTags('levels')
@Controller('levels')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Token inválido o no proporcionado' })
@ApiForbiddenResponse({ type: ErrorResponse, description: 'Acceso denegado: se requiere rol admin' })
export class LevelsController {
  constructor(private readonly levelsService: LevelsService) {}

  @ApiOperation({ summary: 'Lista de todos los niveles' })
  @ApiOkResponse({ type: LevelResponse, isArray: true, description: 'Lista de niveles' })
  @Get()
  async getLevels(): Promise<LevelResponse[]> {
    const levels = await this.levelsService.findAll();
    return LevelMapper.toResponseList(levels);
  }

  @ApiOperation({ summary: 'Detalle de un nivel por uuid' })
  @ApiParam({ name: 'uuid', description: 'UUID único del nivel' })
  @ApiOkResponse({ type: LevelResponse, description: 'Detalle del nivel' })
  @ApiNotFoundResponse({ type: ErrorResponse, description: 'Nivel no encontrado' })
  @Get(':uuid')
  async getLevel(@Param('uuid') uuid: string): Promise<LevelResponse> {
    const level = await this.levelsService.findOneByUuid(uuid);
    return LevelMapper.toResponse(level);
  }

  @ApiOperation({ summary: 'Crear un nuevo nivel' })
  @ApiBody({ type: CreateLevelRequest })
  @ApiCreatedResponse({ type: LevelResponse, description: 'Nivel creado exitosamente' })
  @ApiBadRequestResponse({ type: ErrorResponse, description: 'Datos inválidos' })
  @ApiConflictResponse({ type: ErrorResponse, description: 'Conflict: el nivel ya existe' })
  @Post()
  async createLevel(@Body() dto: CreateLevelRequest): Promise<LevelResponse> {
    const level = await this.levelsService.createLevel(dto);
    return LevelMapper.toResponse(level);
  }

  @ApiOperation({ summary: 'Actualizar un nivel por uuid' })
  @ApiParam({ name: 'uuid', description: 'UUID único del nivel' })
  @ApiBody({ type: UpdateLevelRequest })
  @ApiOkResponse({ type: LevelResponse, description: 'Nivel actualizado exitosamente' })
  @ApiNotFoundResponse({ type: ErrorResponse, description: 'Nivel no encontrado' })
  @ApiBadRequestResponse({ type: ErrorResponse, description: 'Datos inválidos' })
  @ApiConflictResponse({ type: ErrorResponse, description: 'Conflict: el nivel ya existe' })
  @Patch(':uuid')
  async updateLevel(
    @Param('uuid') uuid: string,
    @Body() dto: UpdateLevelRequest,
  ): Promise<LevelResponse> {
    const level = await this.levelsService.updateByUuid(uuid, dto);
    return LevelMapper.toResponse(level);
  }

  @ApiOperation({ summary: 'Eliminar un nivel por uuid' })
  @ApiParam({ name: 'uuid', description: 'UUID único del nivel' })
  @ApiOkResponse({ description: 'Nivel eliminado exitosamente' })
  @ApiNotFoundResponse({ type: ErrorResponse, description: 'Nivel no encontrado' })
  @HttpCode(HttpStatus.OK)
  @Delete(':uuid')
  async deleteLevel(@Param('uuid') uuid: string): Promise<{ message: string }> {
    await this.levelsService.removeByUuid(uuid);
    return { message: 'Nivel eliminado correctamente' };
  }
}
