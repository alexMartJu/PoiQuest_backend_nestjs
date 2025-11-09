import { SetMetadata } from '@nestjs/common';

/**
 * Decorador `@Roles(...)`
 * -----------------------
 * Guarda una metadata con los roles requeridos para acceder a un
 * endpoint. `RolesGuard` lee esta metadata y decide si el usuario
 * tiene permiso.
 *
 * Ejemplo:
 *  @UseGuards(JwtAuthGuard, RolesGuard)
 *  @Roles('admin')
 *  @Get('admin')
 *  adminEndpoint() { ... }
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
