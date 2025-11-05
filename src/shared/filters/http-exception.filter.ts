import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppError } from '../errors/app.error';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let code = 'INTERNAL_SERVER_ERROR';
    let meta: any = undefined;

    // Manejo de errores de dominio (AppError y subclases)
    if (exception instanceof AppError) {
      status = exception.status ?? HttpStatus.BAD_REQUEST;
      code = exception.code;
      message = exception.message;
      meta = exception.meta;
    }
    // Manejo de errores HTTP de NestJS (compatibilidad)
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message;
        code = responseObj.error || exception.name;
      } else {
        message = exception.message;
        code = exception.name;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      code = exception.name;
    }

    const errorResponse: any = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      code,
      message,
    };

    // Incluir metadata solo si existe (errores de dominio)
    if (meta !== undefined) {
      errorResponse.meta = meta;
    }

    // Log estructurado usando Logger de Nest
    try {
      const payload = {
        ...errorResponse,
        stack: exception instanceof Error ? exception.stack : undefined,
      };
      // Logger.error espera un string message y opcionalmente stack trace
      this.logger.error(JSON.stringify(payload), exception instanceof Error ? exception.stack : undefined);
    } catch (logErr) {
      // Fallback si hay problemas al serializar
      console.error('Exception (logger fallback):', errorResponse, exception instanceof Error ? exception.stack : undefined);
    }

    response.status(status).json(errorResponse);
  }
}
