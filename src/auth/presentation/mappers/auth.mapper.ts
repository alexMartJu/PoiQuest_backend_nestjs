import { UserEntity } from '../../../users/domain/entities/user.entity';
import { AuthResponse } from '../dto/responses/auth.response.dto';

/**
 * AuthMapper
 *
 * Transforma `UserEntity` a la forma `AuthResponse` usada por la API.
 * Centraliza las reglas de formato de la representación pública.
 */
export class AuthMapper {
  /**
   * Mapea `UserEntity` a `AuthResponse` (sin tokens).
   * - Acepta que `profile` y `roles` puedan ser opcionales.
   * - Convención: `avatarUrl` y `bio` => `null` si faltan; `name`/`lastname` => '' si faltan.
   */
  static toResponse(user: UserEntity): AuthResponse {
    return {
      userId: user.id,
      name: user.profile?.name || '',
      lastname: user.profile?.lastname || '',
      email: user.email,
      avatarUrl: user.profile?.avatarUrl ?? null,
      bio: user.profile?.bio ?? null,
      roles: user.roles?.map((role) => role.name) ?? [],
    };
  }

  /**
   * Mapea `UserEntity` a `AuthResponse` incluyendo `accessToken` y `refreshToken`.
   * - Mantiene la misma representación de usuario que `toResponse` y añade tokens.
   */
  static toResponseWithTokens(
    user: UserEntity,
    tokens: { accessToken: string; refreshToken: string },
  ): AuthResponse {
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      userId: user.id,
      name: user.profile?.name || '',
      lastname: user.profile?.lastname || '',
      email: user.email,
      avatarUrl: user.profile?.avatarUrl ?? null,
      bio: user.profile?.bio ?? null,
      roles: user.roles?.map((role) => role.name) ?? [],
    };
  }
}
