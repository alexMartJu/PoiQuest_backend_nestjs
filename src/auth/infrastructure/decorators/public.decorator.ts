import { SetMetadata } from '@nestjs/common';

/**
 * Decorador `@Public()`
 * ---------------------
 * Marca un controlador o método como público (no requiere autenticación).
 * Internamente almacena una metadata llamada `isPublic` que es leída
 * por `JwtAuthGuard` para saltarse la verificación del JWT.
 *
 * Uso:
 *  @Public()
 *  @Post('login')
 *  login(...) { ... }
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
