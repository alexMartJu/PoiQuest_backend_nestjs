import { AppError } from './app.error';

/**
 * Error de dominio para validaciones de entrada o reglas de negocio.
 * Mapea típicamente a HTTP 400 Bad Request.
 * El campo `meta` puede incluir un array de detalles de validación.
 */
export class ValidationError extends AppError {
  constructor(message = 'Error de validación', meta?: any) {
    super(message, 'VALIDATION_ERROR', 400, meta);
  }
}
