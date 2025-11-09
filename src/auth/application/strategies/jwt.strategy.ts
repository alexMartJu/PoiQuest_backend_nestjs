import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { JwtPayload } from '../types/jwt-payload';

/**
 * JwtStrategy
 * -----------
 * Estrategia Passport para validar JWTs de acceso.
 * - Extrae el token desde el header `Authorization: Bearer <token>`.
 * - Valida firma y expiración usando la clave `POIQUEST_JWT_ACCESS_KEY`.
 * - Si la validación pasa, Passport llama a `validate(payload)` y el
 *   valor retornado se asigna a `request.user` (usado por los guards y
 *   decoradores como `@CurrentUser()`).
 *
 * Nota:
 * - Aquí devolvemos un objeto con `userId`, `email` y `roles` para que
 *   los controllers puedan acceder a esa info sin tener que decodificar
 *   el token en cada petición.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      // Extrae token del header Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // No ignorar expiración: que falle si está caducado
      ignoreExpiration: false,
      // Clave secreta de acceso tomada del .env via ConfigService
      secretOrKey: configService.get<string>('POIQUEST_JWT_ACCESS_KEY')!,
    });
  }

  // El payload proviene del JWT decodificado. Aqui devolvemos la forma
  // que queremos que tenga `request.user` en los handlers.
  async validate(payload: JwtPayload) {
    return {
      userId: payload.sub,
      email: payload.email,
      roles: payload.roles,
    };
  }
}
