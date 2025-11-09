import { AppError } from './app.error'

/**
 * Error de dominio para accesos no autorizados.
 * Mapea típicamente a HTTP 401 Unauthorized.
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado', meta?: any) {
    super(message, 'UNAUTHORIZED', 401, meta);
  }
}
