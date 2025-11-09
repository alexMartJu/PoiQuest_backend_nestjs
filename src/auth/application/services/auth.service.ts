import { Injectable, Inject } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { promisify } from 'util';
import { UsersService } from '../../../users/application/services/users.service';
import { CreateUserDto } from '../../../users/application/dto/create-user.dto';
import { RegisterStandardUserDto } from '../dto/register-standard-user.dto';
import { AuthRepository } from '../../domain/repositories/auth.repository';
import { UserEntity } from '../../../users/domain/entities/user.entity';
import { UserStatus } from '../../../users/domain/enums/user-status.enum';
import { BlacklistTokenEntity } from '../../domain/entities/blacklist-token.entity';
import type { JwtPayload } from '../types/jwt-payload';
import type { AuthTokens } from '../types/auth-tokens';
import { AuthJwtService } from './auth-jwt.service';
import { UnauthorizedError } from '../../../shared/errors/unauthorized.error';

@Injectable()
export class AuthService {
  constructor(
    @Inject(AuthRepository)
    private readonly authRepo: AuthRepository,
    private readonly authJwtService: AuthJwtService,
    private readonly usersService: UsersService,
  ) {}

  // Crea una cuenta de usuario básica y prepara su perfil asociado.
  // Este método corresponde al registro público (sin atribuciones administrativas).
  async registerStandardUser(dto: RegisterStandardUserDto): Promise<UserEntity> {
    const userDto: CreateUserDto = {
      name: dto.name,
      lastname: dto.lastname,
      email: dto.email,
      password: dto.password,
      // En registros públicos el servidor impone el rol 'user' por seguridad.
      roleName: 'user',
      avatarUrl: dto.avatarUrl,
      bio: dto.bio,
    };

    return this.usersService.createUser(userDto);
  }

  // Emite los tokens de acceso y refresh tras una autenticación válida
  async login(user: UserEntity): Promise<AuthTokens> {
    const roleNames = user.roles ? user.roles.map(r => r.name) : [];

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: roleNames,
      tokenVersion: user.tokenVersion,
    };

    const accessToken = this.authJwtService.generateAccessToken(payload);
    const refreshToken = this.authJwtService.generateRefreshToken(payload);

    return { accessToken, refreshToken };
  }

  // Renueva el access token a partir de un refresh token válido (no rota el refresh token)
  async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    try {
      // Valida la firma y que el refresh token no haya caducado
      const payload = this.authJwtService.verifyRefreshToken(refreshToken);

      // Comprueba si el refresh token fue revocado individualmente (logout en dispositivo)
      const isBlacklisted = await this.authRepo.isTokenBlacklisted(refreshToken);
      if (isBlacklisted) {
        throw new UnauthorizedError('Token invalidado por logout');
      }

      // Recupera el usuario asociado al payload
      const user = await this.usersService.findUserByIdOrFail(payload.sub);

      // Comprueba la versión del token para detectar revocación global (logout-all)
      if (payload.tokenVersion !== user.tokenVersion) {
        throw new UnauthorizedError('Token invalidado por versión');
      }

      // Asegura que la cuenta del usuario esté activa
      if (user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedError('Usuario desactivado');
      }

      // Solo genera un nuevo accessToken; el refreshToken permanece igual
      const roleNames = user.roles ? user.roles.map(r => r.name) : [];
      const newPayload: JwtPayload = {
        sub: user.id,
        email: user.email,
        roles: roleNames,
        tokenVersion: user.tokenVersion,
      };

      const accessToken = this.authJwtService.generateAccessToken(newPayload);

      // Retorna el mismo refreshToken
      return { accessToken, refreshToken };
    } catch (error: any) {
      // Si ya lanzamos un UnauthorizedError dentro del try, relanzarlo
      if (error instanceof UnauthorizedError) throw error;

      // Detectar expiración de token JWT (jsonwebtoken setea error.name === 'TokenExpiredError')
      if (error?.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Refresh token expirado');
      }

      // Log para debugging y devolver un mensaje genérico
      // (no exponemos detalles internos al cliente)
      // eslint-disable-next-line no-console
      console.warn('refreshAccessToken error:', error);
      throw new UnauthorizedError('Token inválido o expirado');
    }
  }

  // Invalida el refresh token recibido para cerrar sesión en el dispositivo actual
  async logout(userId: number, refreshToken: string): Promise<void> {
    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token requerido');
    }

    try {
      // Calcula la expiración para almacenar el token en la blacklist y permitir
      // su limpieza periódica por procesos de mantenimiento.
      const expiresAt = this.authJwtService.extractExpirationDateFromToken(refreshToken);

      const blacklistToken = new BlacklistTokenEntity();
      blacklistToken.userId = userId;
      blacklistToken.token = refreshToken;
      blacklistToken.expiresAt = expiresAt;
      blacklistToken.createdAt = new Date();

      await this.authRepo.saveBlacklistToken(blacklistToken);
    } catch (error) {
      throw new UnauthorizedError('Error al procesar el refresh token');
    }
  }

  // Invalida todas las sesiones del usuario (logout global).
  // Implementación: incrementa tokenVersion para invalidar los tokens existentes.
  async invalidateAllSessions(userId: number): Promise<void> {
    const user = await this.usersService.findUserByIdOrFail(userId);
    try {
      // Mantengo el mismo mecanismo (incremento de tokenVersion),
      // pero el nombre del método expresa la intención: invalidar sesiones.
      user.tokenVersion++; // Incrementa tokenVersion para invalidar todos los tokens existentes
      await this.usersService.saveUser(user);
    } catch (error) {
      throw new UnauthorizedError('Error al invalidar las sesiones');
    }
  }

  // Actualiza la contraseña y fuerza la revocación de todas las sesiones del usuario
  async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<void> {
    // Obtiene usuario por su ID
    const user = await this.usersService.findUserByIdOrFail(userId);

    // Verifica contraseña actual
    const compare = promisify(bcrypt.compare) as (data: string, encrypted: string) => Promise<boolean>;
    const isValid = await compare(oldPassword, user.password);
    if (!isValid) {
      throw new UnauthorizedError('Contraseña actual incorrecta');
    }

    try {
      // Actualiza contraseña
      const hash = promisify(bcrypt.hash) as (data: string, saltOrRounds: number) => Promise<string>;
      user.password = await hash(newPassword, 12);
      
      // Incrementa tokenVersion para invalidar todos los tokens
      user.tokenVersion++;
      
      await this.usersService.saveUser(user);
    } catch (error) {
      throw new UnauthorizedError('Error al cambiar la contraseña');
    }
  }


  // Recupera el usuario por su id y verifica que la cuenta esté activa
  async getCurrentUser(userId: number): Promise<UserEntity> {
    // Obtiene usuario por su ID
    const user = await this.usersService.findUserByIdOrFail(userId);

    // Verifica si el usuario está activo
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedError('Usuario desactivado');
    }

    return user;
  }

  // Comprueba email y contraseña; devuelve el usuario cuando las credenciales son válidas
  async validateCredentials(email: string, password: string): Promise<UserEntity | null> {
    // Busca el registro por correo
    const user = await this.usersService.findUserByEmailOrFail(email);

  const compare2 = promisify(bcrypt.compare) as (data: string, encrypted: string) => Promise<boolean>;
  const isPasswordValid = await compare2(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Contraseña incorrecta');
    }

    // Asegura que la cuenta no esté desactivada
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedError('Usuario suspendido');
    }

    return user;
  }
}
