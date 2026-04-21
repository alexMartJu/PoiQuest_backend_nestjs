import {
  Controller, Get, UseGuards,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiOkResponse, ApiBearerAuth,
  ApiUnauthorizedResponse, ApiNotFoundResponse, ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { GamificationService } from '../../application/services/gamification.service';
import { GamificationProgressResponse } from '../dto/responses/gamification-progress.response.dto';
import { GamificationMapper } from '../mappers/gamification.mapper';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/infrastructure/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../../auth/presentation/types/current-user-payload';
import { ErrorResponse } from '../../../shared/dto/error.response.dto';

@ApiTags('gamification')
@Controller('gamification')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @ApiOperation({
    summary: 'Obtener progreso de gamificación del usuario autenticado',
    description: 'Devuelve puntos, nivel, estadísticas, logros y descuento del usuario.',
  })
  @ApiOkResponse({ type: GamificationProgressResponse, description: 'Progreso de gamificación' })
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Token inválido o no proporcionado' })
  @ApiNotFoundResponse({ type: ErrorResponse, description: 'Perfil no encontrado' })
  @ApiInternalServerErrorResponse({ type: ErrorResponse, description: 'Error interno' })
  @Get('my-progress')
  async getMyProgress(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<GamificationProgressResponse> {
    const progress = await this.gamificationService.getProgress(user.userId);
    return GamificationMapper.toResponse(progress);
  }
}
