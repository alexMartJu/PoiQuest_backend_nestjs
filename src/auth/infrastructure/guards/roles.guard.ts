import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { ForbiddenError } from '../../../shared/errors/forbidden.error';

/**
 * RolesGuard
 * ---------
 * Controla el acceso por roles usando la metadata creada por `@Roles(...)`.
 * - Si no se requieren roles para la ruta, permite el acceso.
 * - Si se requieren, extrae `request.user` (insertado por JwtStrategy)
 *   y comprueba que `user.roles` contenga al menos uno de los roles
 *   requeridos. Si no, lanza `ForbiddenError`.
 *
 * Ejemplo de uso:
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   @Roles('admin')
 *   async adminEndpoint() { ... }
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Lee la metadata de roles definida por el decorador @Roles
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si no se requieren roles, permite el acceso (no hay restricción)
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Obtiene el usuario autenticado (rellenado por JwtStrategy)
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Si no hay usuario o no tiene roles, denegar explícitamente
    if (!user || !user.roles) {
      throw new ForbiddenError('Usuario sin roles definidos');
    }

    // Comprueba si el usuario tiene alguno de los roles requeridos
    const hasRole = requiredRoles.some((role) => user.roles.includes(role));

    if (!hasRole) {
      throw new ForbiddenError('No tienes los permisos necesarios');
    }

    return true;
  }
}
