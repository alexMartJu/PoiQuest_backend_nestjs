import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiBody,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { ErrorResponse } from '../../../shared/dto/error.response.dto';
import { ProfileService } from '../../application/services/profile.service';
import { UpdateProfileRequest } from '../dto/requests/update-profile.request.dto';
import { UpdateAvatarRequest } from '../dto/requests/update-avatar.request.dto';
import { ProfileResponse } from '../dto/responses/profile.response.dto';
import { ProfileMapper } from '../mappers/profile.mapper';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/infrastructure/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../../auth/presentation/types/current-user-payload';

@ApiTags('Profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiOkResponse({ type: ProfileResponse })
  @ApiUnauthorizedResponse({ type: ErrorResponse })
  @ApiNotFoundResponse({ type: ErrorResponse })
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  async getMyProfile(@CurrentUser() user: CurrentUserPayload): Promise<ProfileResponse> {
    const profile = await this.profileService.getMyProfile(user.userId);
    return ProfileMapper.toResponse(profile);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Actualizar parcialmente el perfil del usuario autenticado (name, lastname, bio)' })
  @ApiBody({ type: UpdateProfileRequest })
  @ApiOkResponse({ type: ProfileResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @ApiUnauthorizedResponse({ type: ErrorResponse })
  @ApiNotFoundResponse({ type: ErrorResponse })
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  async updateMyProfile(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateProfileRequest,
  ): Promise<ProfileResponse> {
    const profile = await this.profileService.updateMyProfile(user.userId, dto);
    return ProfileMapper.toResponse(profile);
  }

  @Patch('me/avatar')
  @ApiOperation({ summary: 'Actualizar avatar del usuario autenticado' })
  @ApiBody({ type: UpdateAvatarRequest })
  @ApiOkResponse({ type: ProfileResponse })
  @ApiBadRequestResponse({ type: ErrorResponse, description: 'avatarUrl inválido' })
  @ApiUnauthorizedResponse({ type: ErrorResponse })
  @ApiNotFoundResponse({ type: ErrorResponse })
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  async updateMyAvatar(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateAvatarRequest,
  ): Promise<ProfileResponse> {
    const profile = await this.profileService.updateMyAvatar(user.userId, dto.avatarUrl);
    return ProfileMapper.toResponse(profile);
  }
}
