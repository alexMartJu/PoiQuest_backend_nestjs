import { AppError } from './app.error';

/**
 * Error de dominio para denegaciones de acceso (authorization).
 * Mapea típicamente a HTTP 403 Forbidden.
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Acceso denegado', meta?: any) {
    super(message, 'FORBIDDEN', 403, meta);
  }
}
