import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { JwtPayload } from '../types/jwt-payload';
import { UnauthorizedError } from '../../../shared/errors/unauthorized.error';

@Injectable()
export class AuthJwtService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  // ====================================================
  // API PÚBLICA: generación y verificación de tokens
  // ====================================================

  // Crea un access token JWT a partir del payload provisto
  generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get('POIQUEST_JWT_ACCESS_TTL'),
    } as any);
  }

  // Crea un refresh token (firma con la clave de refresh)
  generateRefreshToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get('POIQUEST_JWT_REFRESH_KEY'),
      expiresIn: this.configService.get('POIQUEST_JWT_REFRESH_TTL'),
    } as any);
  }

  /**
   * Verifica la firma y decodifica un refresh token, devolviendo el payload.
   * Lanza si el token no es válido o la firma no coincide.
   */
  verifyRefreshToken(token: string): JwtPayload {
    return this.jwtService.verify<JwtPayload>(token, {
      secret: this.configService.get<string>('POIQUEST_JWT_REFRESH_KEY'),
    });
  }

  // ====================================================
  // Helpers / utilidades (lectura y extracción)
  // ====================================================

  /**
   * Decodifica el JWT sin comprobar la firma. Útil sólo cuando ya se validó
   * previamente el token y se necesita acceder a su contenido.
   */
  decodeToken(token: string): any {
    return this.jwtService.decode(token);
  }

  /**
   * Recupera el campo `sub` (subject) del token y lo interpreta como userId.
   * Lanza un Error claro si el token no contiene subject.
   */
  extractSubjectFromToken(token: string): number {
    const payload = this.decodeToken(token);
    if (!payload || !payload.sub) {
      throw new UnauthorizedError('Token inválido: no contiene sub');
    }
    // Actualmente `sub` se usa como userId numérico en este proyecto.
    return payload.sub;
  }

  /**
   * Devuelve la fecha de expiración del token (campo `exp`) como Date.
   * El campo `exp` en JWT es el timestamp en segundos; aquí lo convertimos.
   */
  extractExpirationDateFromToken(token: string): Date {
    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) {
      throw new UnauthorizedError('Token inválido: no contiene exp');
    }
    return new Date(payload.exp * 1000);
  }
}
