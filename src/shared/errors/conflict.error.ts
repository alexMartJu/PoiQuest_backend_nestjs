import { AppError } from './app.error';

/**
 * Error de dominio para conflictos de integridad o duplicados.
 * Mapea típicamente a HTTP 409 Conflict.
 * Útil para traducir errores DB de tipo duplicate-key o violaciones de constraint.
 */
export class ConflictError extends AppError {
  constructor(message = 'Conflicto detectado', meta?: any) {
    super(message, 'CONFLICT', 409, meta);
  }
}
