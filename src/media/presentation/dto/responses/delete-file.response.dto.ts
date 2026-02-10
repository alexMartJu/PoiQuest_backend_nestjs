import { ApiProperty } from '@nestjs/swagger';

export class DeleteFileResponse {
  @ApiProperty({ 
    description: 'Mensaje de confirmación',
    example: 'Archivo eliminado exitosamente'
  })
  message!: string;

  @ApiProperty({ 
    description: 'Nombre del archivo eliminado',
    example: '1738996800000-photo.jpg'
  })
  fileName!: string;
}
