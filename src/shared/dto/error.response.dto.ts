import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponse {
  @ApiProperty({
    description: 'Código de estado HTTP',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Mensaje de error descriptivo',
    oneOf: [
      { type: 'string' },
      { type: 'array', items: { type: 'string' } },
    ],
    example: 'Evento no encontrado',
  })
  message: string | string[];

  @ApiProperty({
    description: 'Código de error interno para identificar la causa',
    example: 'NOT_FOUND',
    required: false,
  })
  code?: string;

  @ApiProperty({
    description: 'Metadatos adicionales del error (campo afectado, etc.)',
    example: { field: 'slug' },
    required: false,
  })
  meta?: any;

  @ApiProperty({
    description: 'Timestamp ISO del error',
    example: '2025-11-05T12:34:56.789Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Ruta del endpoint donde ocurrió el error',
    example: '/events/museo-del-prado-x1y2z3',
  })
  path: string;

  @ApiProperty({
    description: 'Método HTTP de la petición',
    example: 'GET',
  })
  method: string;
}
