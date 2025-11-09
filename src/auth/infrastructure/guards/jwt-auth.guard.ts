import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Guard personalizado que envuelve a `AuthGuard('jwt')` de Passport.
 *
 * Comportamiento:
 * - Si la ruta está marcada con `@Public()` evita la verificación JWT y
 *   permite el acceso.
 * - En rutas no públicas delega en `super.canActivate(context)` que
 *   ejecuta la lógica de Passport/JwtStrategy (extracción del token,
 *   verificación de firma/expiración y llenado de `request.user`).
 *
 * Uso típico:
 *   @UseGuards(JwtAuthGuard)
 *   @Get('me')
 *   getMe(@CurrentUser() user) { ... }
 *
 * Nota: `@ApiBearerAuth()` solo documenta Swagger; la verificación real
 * la hace este guard y la estrategia JWT.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Comprueba si la ruta está marcada como pública mediante metadata
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si la ruta es pública, permite sin verificar JWT
    if (isPublic) {
      return true;
    }

    // En caso contrario delega en Passport (JwtStrategy)
    return super.canActivate(context);
  }
}
