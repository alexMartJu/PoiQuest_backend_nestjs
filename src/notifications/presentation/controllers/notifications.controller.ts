import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { NotificationsService } from '../../application/services/notifications.service';
import { NotificationMapper } from '../mappers/notification.mapper';
import { NotificationResponse } from '../dto/responses/notification.response.dto';
import { PaginatedNotificationsResponse } from '../dto/responses/paginated-notifications.response.dto';
import { UnreadCountResponse } from '../dto/responses/unread-count.response.dto';
import { GetNotificationsRequest } from '../dto/requests/get-notifications.request.dto';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/infrastructure/decorators/current-user.decorator';
import { ErrorResponse } from '../../../shared/dto/error.response.dto';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @ApiOperation({
    summary: 'Obtiene las notificaciones del usuario autenticado',
    description: 'Devuelve las notificaciones paginadas por cursor (id descendente). La primera página no necesita cursor.',
  })
  @ApiQuery({ name: 'cursor', required: false, type: Number, description: 'Id de la última notificación recibida' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Máximo de items por página (1–50). Default 20' })
  @ApiOkResponse({ type: PaginatedNotificationsResponse })
  @ApiUnauthorizedResponse({ type: ErrorResponse })
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  @Get()
  async getNotifications(
    @CurrentUser() user: { userId: number },
    @Query() query: GetNotificationsRequest,
  ): Promise<PaginatedNotificationsResponse> {
    const { data, nextCursor } = await this.notificationsService.getNotifications(
      user.userId,
      query.cursor,
      query.limit ?? 20,
    );
    return {
      data: NotificationMapper.toResponseList(data),
      nextCursor,
    };
  }

  @ApiOperation({ summary: 'Cuenta las notificaciones no leídas del usuario autenticado' })
  @ApiOkResponse({ type: UnreadCountResponse })
  @ApiUnauthorizedResponse({ type: ErrorResponse })
  @Get('unread-count')
  async getUnreadCount(
    @CurrentUser() user: { userId: number },
  ): Promise<UnreadCountResponse> {
    const count = await this.notificationsService.getUnreadCount(user.userId);
    return { count };
  }

  @ApiOperation({ summary: 'Marca todas las notificaciones del usuario como leídas' })
  @ApiOkResponse({ description: 'Notificaciones marcadas como leídas' })
  @ApiUnauthorizedResponse({ type: ErrorResponse })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('read-all')
  async markAllAsRead(@CurrentUser() user: { userId: number }): Promise<void> {
    await this.notificationsService.markAllAsRead(user.userId);
  }

  @ApiOperation({ summary: 'Marca una notificación específica como leída' })
  @ApiParam({ name: 'id', type: Number, description: 'Id de la notificación', example: 1 })
  @ApiOkResponse({ type: NotificationResponse })
  @ApiNotFoundResponse({ type: ErrorResponse, description: 'Notificación no encontrada' })
  @ApiUnauthorizedResponse({ type: ErrorResponse })
  @HttpCode(HttpStatus.OK)
  @Patch(':id/read')
  async markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { userId: number },
  ): Promise<NotificationResponse> {
    const notification = await this.notificationsService.markAsRead(id, user.userId);
    return NotificationMapper.toResponse(notification);
  }
}
