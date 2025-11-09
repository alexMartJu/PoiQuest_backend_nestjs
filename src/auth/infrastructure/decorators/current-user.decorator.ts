import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorador de parámetro `@CurrentUser()`
 * -------------------------------------
 * Extrae `request.user` (set por Passport/JwtStrategy) y lo pasa
 * como argumento al handler del controlador. Usar en endpoints
 * protegidos por `JwtAuthGuard` para recibir directamente el usuario
 * autenticado sin repetir lógica en cada controlador.
 *
 * Ejemplo:
 *   @UseGuards(JwtAuthGuard)
 *   getMe(@CurrentUser() user) { ... }
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    // `request.user` lo pone Passport después de validar el JWT en JwtStrategy
    return request.user;
  },
);
