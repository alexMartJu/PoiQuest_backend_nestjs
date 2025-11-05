import { AppError } from './app.error';

/**
 * Error de dominio para recursos no encontrados.
 * Mapea típicamente a HTTP 404 Not Found.
 */
export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado', meta?: any) {
    super(message, 'NOT_FOUND', 404, meta);
  }
}
