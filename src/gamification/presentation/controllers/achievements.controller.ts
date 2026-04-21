import { Controller, Get, Post, Patch, Delete, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiBadRequestResponse, ApiConflictResponse, ApiParam, ApiBody, ApiBearerAuth, ApiUnauthorizedResponse, ApiForbiddenResponse } from '@nestjs/swagger';
import { AchievementsService } from '../../application/services/achievements.service';
import { CreateAchievementRequest } from '../dto/requests/create-achievement.request.dto';
import { UpdateAchievementRequest } from '../dto/requests/update-achievement.request.dto';
import { AchievementAdminResponse } from '../dto/responses/achievement-admin.response.dto';
import { AchievementMapper } from '../mappers/achievement.mapper';
import { ErrorResponse } from '../../../shared/dto/error.response.dto';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';

@ApiTags('achievements')
@Controller('achievements')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Token inválido o no proporcionado' })
@ApiForbiddenResponse({ type: ErrorResponse, description: 'Acceso denegado: se requiere rol admin' })
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @ApiOperation({ summary: 'Lista de todos los logros' })
  @ApiOkResponse({ type: AchievementAdminResponse, isArray: true, description: 'Lista de logros' })
  @Get()
  async getAchievements(): Promise<AchievementAdminResponse[]> {
    const achievements = await this.achievementsService.findAll();
    return AchievementMapper.toResponseList(achievements);
  }

  @ApiOperation({ summary: 'Detalle de un logro por uuid' })
  @ApiParam({ name: 'uuid', description: 'UUID único del logro' })
  @ApiOkResponse({ type: AchievementAdminResponse, description: 'Detalle del logro' })
  @ApiNotFoundResponse({ type: ErrorResponse, description: 'Logro no encontrado' })
  @Get(':uuid')
  async getAchievement(@Param('uuid') uuid: string): Promise<AchievementAdminResponse> {
    const achievement = await this.achievementsService.findOneByUuid(uuid);
    return AchievementMapper.toResponse(achievement);
  }

  @ApiOperation({ summary: 'Crear un nuevo logro' })
  @ApiBody({ type: CreateAchievementRequest })
  @ApiCreatedResponse({ type: AchievementAdminResponse, description: 'Logro creado exitosamente' })
  @ApiBadRequestResponse({ type: ErrorResponse, description: 'Datos inválidos' })
  @ApiConflictResponse({ type: ErrorResponse, description: 'Conflict: la clave del logro ya existe' })
  @Post()
  async createAchievement(@Body() dto: CreateAchievementRequest): Promise<AchievementAdminResponse> {
    const achievement = await this.achievementsService.createAchievement(dto);
    return AchievementMapper.toResponse(achievement);
  }

  @ApiOperation({ summary: 'Actualizar un logro por uuid' })
  @ApiParam({ name: 'uuid', description: 'UUID único del logro' })
  @ApiBody({ type: UpdateAchievementRequest })
  @ApiOkResponse({ type: AchievementAdminResponse, description: 'Logro actualizado exitosamente' })
  @ApiNotFoundResponse({ type: ErrorResponse, description: 'Logro no encontrado' })
  @ApiBadRequestResponse({ type: ErrorResponse, description: 'Datos inválidos' })
  @ApiConflictResponse({ type: ErrorResponse, description: 'Conflict: la clave del logro ya existe' })
  @Patch(':uuid')
  async updateAchievement(
    @Param('uuid') uuid: string,
    @Body() dto: UpdateAchievementRequest,
  ): Promise<AchievementAdminResponse> {
    const achievement = await this.achievementsService.updateByUuid(uuid, dto);
    return AchievementMapper.toResponse(achievement);
  }

  @ApiOperation({ summary: 'Eliminar un logro por uuid' })
  @ApiParam({ name: 'uuid', description: 'UUID único del logro' })
  @ApiOkResponse({ description: 'Logro eliminado exitosamente' })
  @ApiNotFoundResponse({ type: ErrorResponse, description: 'Logro no encontrado' })
  @HttpCode(HttpStatus.OK)
  @Delete(':uuid')
  async deleteAchievement(@Param('uuid') uuid: string): Promise<{ message: string }> {
    await this.achievementsService.removeByUuid(uuid);
    return { message: 'Logro eliminado correctamente' };
  }
}
