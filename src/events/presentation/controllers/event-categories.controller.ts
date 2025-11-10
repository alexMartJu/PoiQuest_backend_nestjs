import { Controller, Get, Post, Patch, Delete, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiBadRequestResponse, ApiConflictResponse, ApiParam, ApiBody, ApiBearerAuth, ApiUnauthorizedResponse, ApiForbiddenResponse } from '@nestjs/swagger';
import { EventCategoriesService } from '../../application/services/event-categories.service';
import { CreateEventCategoryRequest } from '../dto/requests/create-event-category.request.dto';
import { UpdateEventCategoryRequest } from '../dto/requests/update-event-category.request.dto';
import { EventCategoryResponse } from '../dto/responses/event-category.response.dto';
import { EventCategoryMapper } from '../mappers/event-category.mapper';
import { ErrorResponse } from '../../../shared/dto/error.response.dto';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { Public } from '../../../auth/infrastructure/decorators/public.decorator';

@ApiTags('event-categories')
@Controller('event-categories')
export class EventCategoriesController {
  constructor(private readonly categoriesService: EventCategoriesService) {}

  @ApiOperation({ summary: 'Lista de todas las categorías de eventos' })
  @ApiOkResponse({ type: EventCategoryResponse, isArray: true, description: 'Lista de categorías' })
  @Public()
  @Get()
  async getCategories(): Promise<EventCategoryResponse[]> {
    const categories = await this.categoriesService.findAll();
    return EventCategoryMapper.toResponseList(categories);
  }

  @ApiOperation({ summary: 'Detalle de una categoría por uuid' })
  @ApiParam({ name: 'uuid', description: 'UUID único de la categoría', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiOkResponse({ type: EventCategoryResponse, description: 'Detalle de la categoría' })
  @ApiNotFoundResponse({ type: ErrorResponse, description: 'Categoría no encontrada' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Token inválido o no proporcionado' })
  @ApiForbiddenResponse({ type: ErrorResponse, description: 'Acceso denegado: se requiere rol admin' })
  @Get(':uuid')
  async getCategory(@Param('uuid') uuid: string): Promise<EventCategoryResponse> {
    const category = await this.categoriesService.findOneByUuid(uuid);
    return EventCategoryMapper.toResponse(category)!;
  }

  @ApiOperation({ summary: 'Crear una nueva categoría' })
  @ApiBody({ type: CreateEventCategoryRequest })
  @ApiCreatedResponse({ type: EventCategoryResponse, description: 'Categoría creada exitosamente' })
  @ApiBadRequestResponse({ type: ErrorResponse, description: 'Datos inválidos' })
  @ApiConflictResponse({ type: ErrorResponse, description: 'Conflict: uuid o nombre ya existe' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Token inválido o no proporcionado' })
  @ApiForbiddenResponse({ type: ErrorResponse, description: 'Acceso denegado: se requiere rol admin' })
  @Post()
  async createCategory(@Body() dto: CreateEventCategoryRequest): Promise<EventCategoryResponse> {
    const category = await this.categoriesService.createCategory(dto);
    return EventCategoryMapper.toResponse(category)!;
  }

  @ApiOperation({ summary: 'Actualizar una categoría por uuid' })
  @ApiParam({ name: 'uuid', description: 'UUID único de la categoría', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiBody({ type: UpdateEventCategoryRequest })
  @ApiOkResponse({ type: EventCategoryResponse, description: 'Categoría actualizada exitosamente' })
  @ApiNotFoundResponse({ type: ErrorResponse, description: 'Categoría no encontrada' })
  @ApiBadRequestResponse({ type: ErrorResponse, description: 'Datos inválidos' })
  @ApiConflictResponse({ type: ErrorResponse, description: 'Conflict: el nombre ya existe' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Token inválido o no proporcionado' })
  @ApiForbiddenResponse({ type: ErrorResponse, description: 'Acceso denegado: se requiere rol admin' })
  @Patch(':uuid')
  async updateCategory(
    @Param('uuid') uuid: string, 
    @Body() dto: UpdateEventCategoryRequest
  ): Promise<EventCategoryResponse> {
    const category = await this.categoriesService.updateByUuid(uuid, dto);
    return EventCategoryMapper.toResponse(category)!;
  }

  @ApiOperation({ summary: 'Eliminar una categoría por uuid (soft delete)' })
  @ApiParam({ name: 'uuid', description: 'UUID único de la categoría', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiOkResponse({ description: 'Categoría eliminada exitosamente' })
  @ApiNotFoundResponse({ type: ErrorResponse, description: 'Categoría no encontrada' })
  @ApiBadRequestResponse({ type: ErrorResponse, description: 'No se puede eliminar la categoría porque existen eventos asociados' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Token inválido o no proporcionado' })
  @ApiForbiddenResponse({ type: ErrorResponse, description: 'Acceso denegado: se requiere rol admin' })
  @HttpCode(HttpStatus.OK)
  @Delete(':uuid')
  async deleteCategory(@Param('uuid') uuid: string): Promise<{ message: string }> {
    await this.categoriesService.removeByUuid(uuid);
    return { message: 'Categoría eliminada correctamente' };
  }
}
