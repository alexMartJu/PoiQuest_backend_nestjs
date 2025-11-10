import { Controller, Get, Post, Patch, Body, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiParam,
  ApiBody,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { ErrorResponse } from '../../../shared/dto/error.response.dto';
import { UsersService } from '../../application/services/users.service';
import { RegisterValidatorRequest } from '../dto/requests/register-validator.request.dto';
import { UserResponse } from '../dto/responses/user.response.dto';
import { UserMapper } from '../mappers/user.mapper';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Obtener todos los usuarios (solo admin)' })
  @ApiOkResponse({ type: [UserResponse] })
  @ApiUnauthorizedResponse({ type: ErrorResponse })
  @ApiForbiddenResponse({ type: ErrorResponse })
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  async findAll(): Promise<UserResponse[]> {
    const users = await this.usersService.findAll();
    return UserMapper.toResponseList(users);
  }

  @Get('active')
  @Roles('admin')
  @ApiOperation({ summary: 'Obtener usuarios con status active (solo admin)' })
  @ApiOkResponse({ type: [UserResponse] })
  @ApiUnauthorizedResponse({ type: ErrorResponse })
  @ApiForbiddenResponse({ type: ErrorResponse })
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  async findAllActive(): Promise<UserResponse[]> {
    const users = await this.usersService.findAllActive();
    return UserMapper.toResponseList(users);
  }

  @Get('disabled')
  @Roles('admin')
  @ApiOperation({ summary: 'Obtener usuarios con status disabled (solo admin)' })
  @ApiOkResponse({ type: [UserResponse] })
  @ApiUnauthorizedResponse({ type: ErrorResponse })
  @ApiForbiddenResponse({ type: ErrorResponse })
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  async findAllDisabled(): Promise<UserResponse[]> {
    const users = await this.usersService.findAllDisabled();
    return UserMapper.toResponseList(users);
  }

  @Patch('profile/:profileUuid/disable')
  @Roles('admin')
  @ApiOperation({ summary: 'Deshabilitar una cuenta por UUID de perfil (solo admin)' })
  @ApiParam({ name: 'profileUuid', description: 'UUID del perfil del usuario' })
  @ApiOkResponse({ type: UserResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @ApiUnauthorizedResponse({ type: ErrorResponse })
  @ApiForbiddenResponse({ type: ErrorResponse })
  @ApiNotFoundResponse({ type: ErrorResponse })
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  async disableUserByProfileUuid(
    @Param('profileUuid', new ParseUUIDPipe()) profileUuid: string,
  ): Promise<UserResponse> {
    const user = await this.usersService.disableUserByProfileUuid(profileUuid);
    return UserMapper.toResponse(user);
  }

  @Patch('profile/:profileUuid/enable')
  @Roles('admin')
  @ApiOperation({ summary: 'Activar una cuenta por UUID de perfil (solo admin)' })
  @ApiParam({ name: 'profileUuid', description: 'UUID del perfil del usuario' })
  @ApiOkResponse({ type: UserResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @ApiUnauthorizedResponse({ type: ErrorResponse })
  @ApiForbiddenResponse({ type: ErrorResponse })
  @ApiNotFoundResponse({ type: ErrorResponse })
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  async enableUserByProfileUuid(
    @Param('profileUuid', new ParseUUIDPipe()) profileUuid: string,
  ): Promise<UserResponse> {
    const user = await this.usersService.enableUserByProfileUuid(profileUuid);
    return UserMapper.toResponse(user);
  }

  @Post('validator')
  @Roles('admin')
  @ApiOperation({ summary: 'Registrar un usuario con rol ticket_validator (solo admin)' })
  @ApiBody({ type: RegisterValidatorRequest })
  @ApiOkResponse({ type: UserResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @ApiConflictResponse({ type: ErrorResponse })
  @ApiUnauthorizedResponse({ type: ErrorResponse })
  @ApiForbiddenResponse({ type: ErrorResponse })
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  async registerValidator(@Body() dto: RegisterValidatorRequest): Promise<UserResponse> {
    const user = await this.usersService.registerValidator(dto);
    return UserMapper.toResponse(user);
  }
}
