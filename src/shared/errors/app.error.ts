/**
 * Clase base para errores de aplicación/dominio.
 * Permite definir errores semánticos independientes del transporte (HTTP, gRPC, etc.)
 * que luego son mapeados por la capa de presentación (ej. GlobalExceptionFilter).
 */
export class AppError extends Error {
  /**
   * Código identificador del error (ej. 'NOT_FOUND', 'CONFLICT', 'VALIDATION_ERROR')
   * Útil para i18n, logging y métricas.
   */
  public readonly code: string;

  /**
   * Código HTTP sugerido (opcional). Si no se proporciona, el filtro puede usar un default.
   */
  public readonly status?: number;

  /**
   * Metadata adicional del error (ej. campo afectado, id del recurso).
   * Evitar incluir información sensible aquí en producción.
   */
  public readonly meta?: any;

  constructor(message: string, code = 'ERROR', status?: number, meta?: any) {
    super(message);
    this.code = code;
    this.status = status;
    this.meta = meta;

    // Mantiene la cadena de prototipos correcta para instanceof
    Object.setPrototypeOf(this, new.target.prototype);

    // Captura stack trace correctamente
    Error.captureStackTrace(this, this.constructor);
  }
}
