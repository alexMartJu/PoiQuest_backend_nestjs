import { Controller, Post, Body, Get, UseGuards, Req, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiOkResponse, ApiBearerAuth, ApiBody, ApiUnauthorizedResponse, ApiConflictResponse, ApiBadRequestResponse, ApiNoContentResponse } from '@nestjs/swagger';
import { AuthService } from '../../application/services/auth.service';
import { AuthJwtService } from '../../application/services/auth-jwt.service';

import { RegisterStandardUserRequest } from '../dto/requests/register-standard-user.request.dto';
import { LoginRequest } from '../dto/requests/login.request.dto';
import { RefreshTokenRequest } from '../dto/requests/refresh-token.request.dto';
import { AuthResponse } from '../dto/responses/auth.response.dto';
import { AuthMapper } from '../mappers/auth.mapper';

import { Public } from '../../infrastructure/decorators/public.decorator';
import { CurrentUser } from '../../infrastructure/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { LocalAuthGuard } from '../../infrastructure/guards/local-auth.guard';
import { LogoutRequestDto } from '../dto/requests/logout.request.dto';
import { ChangePasswordDto } from '../dto/requests/change-password.request.dto';

import type { RequestWithUser } from '../types/request-with-user';
import type { CurrentUserPayload } from '../types/current-user-payload';

import { ErrorResponse } from '../../../shared/dto/error.response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authJwtService: AuthJwtService,
  ) {}

  @ApiOperation({ summary: 'Crear cuenta básica', description: 'Registra una cuenta de usuario básica; el servidor asigna el rol por defecto de forma automática.' })
  @ApiCreatedResponse({ type: AuthResponse, description: 'Cuenta creada con éxito' })
  @ApiConflictResponse({ type: ErrorResponse, description: 'Ya existe una cuenta asociada al correo proporcionado' })
  @ApiBadRequestResponse({ type: ErrorResponse, description: 'Entrada inválida' })
  @ApiBody({ type: RegisterStandardUserRequest })
  @Public()
  @Post('register-standard-user')
  async registerStandardUser(@Body() requestDto: RegisterStandardUserRequest): Promise<AuthResponse> {
    const user = await this.authService.registerStandardUser({ ...requestDto });
    return AuthMapper.toResponse(user);
  }

  @ApiOperation({ summary: 'Autenticación (login)', description: 'Valida email y contraseña y emite tokens de acceso y refresco para el cliente.' })
  @ApiOkResponse({ type: AuthResponse, description: 'Acceso concedido' })
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Email o contraseña incorrectos' })
  @ApiBody({ type: LoginRequest })
  @HttpCode(200)
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: RequestWithUser): Promise<AuthResponse> {
    const user = req.user;
    const tokens = await this.authService.login(user);
    return AuthMapper.toResponseWithTokens(user, tokens);
  }

  @ApiOperation({ summary: 'Generar nuevo access token', description: 'Utiliza un refresh token válido para emitir un nuevo access token sin rotar el refresh token.' })
  @ApiOkResponse({ type: AuthResponse, description: 'Access token renovado' })
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Refresh token no válido o caducado' })
  @ApiBody({ type: RefreshTokenRequest })
  @HttpCode(200)
  @Public()
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenRequest): Promise<AuthResponse> {
    const tokens = await this.authService.refreshAccessToken(dto.refreshToken);
    const userId = this.authJwtService.extractSubjectFromToken(tokens.accessToken);
    const user = await this.authService.getCurrentUser(userId);

    return AuthMapper.toResponseWithTokens(user, tokens);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar sesión del dispositivo', description: 'Invalida el refresh token proporcionado para el dispositivo actual añadiéndolo a la lista negra.' })
  @ApiNoContentResponse({ description: 'Sesión cerrada correctamente' })
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Acceso no autorizado' })
  @ApiBadRequestResponse({ type: ErrorResponse, description: 'refreshToken faltante o inválido' })
  @ApiBody({ 
    type: LogoutRequestDto,
    description: 'Refresh Token a invalidar'
  })
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@CurrentUser() user: CurrentUserPayload, @Body() dto: LogoutRequestDto): Promise<void> {
    await this.authService.logout(user.userId, dto.refreshToken);
    // No content returned (204)
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar sesión en todos los dispositivos', description: 'Invalida todas las sesiones del usuario (logout global).' })
  @ApiNoContentResponse({ description: 'Todas las sesiones revocadas' })
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Acceso no autorizado' })
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  async logoutAllDevices(@CurrentUser() user: CurrentUserPayload): Promise<void> {
    await this.authService.invalidateAllSessions(user.userId);
    // No content returned (204)
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar credencial', description: 'Actualiza la contraseña y fuerza la reautenticación en todos los dispositivos.' })
  @ApiOkResponse({ description: 'Credencial actualizada correctamente' })
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'La contraseña actual no coincide' })
  @ApiBody({ 
    type: ChangePasswordDto,
    description: 'Incluye la contraseña actual y la nueva contraseña para proceder al cambio.'
  })
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@CurrentUser() user: CurrentUserPayload, @Body() dto: ChangePasswordDto): Promise<{ message: string }> {
    await this.authService.changePassword(user.userId, dto.oldPassword, dto.newPassword);
    return { message: 'Contraseña actualizada. Inicia sesión nuevamente en todos tus dispositivos' };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Perfil actual', description: 'Devuelve el perfil y los roles del usuario autenticado según su token.' })
  @ApiOkResponse({ type: AuthResponse, description: 'Perfil obtenido' })
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Acceso no autorizado' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@CurrentUser() currentUser: CurrentUserPayload): Promise<AuthResponse> {
    const user = await this.authService.getCurrentUser(currentUser.userId);
    return AuthMapper.toResponse(user);
  }
}
