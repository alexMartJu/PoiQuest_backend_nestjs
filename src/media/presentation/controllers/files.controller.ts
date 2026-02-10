import {
  Controller,
  Post,
  Get,
  Delete,
  Query,
  Param,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { FilesService } from '../../application/services/files.service';
import { GeneratePresignedUrlRequest } from '../dto/requests/generate-presigned-url.request.dto';
import { UploadFileResponse } from '../dto/responses/upload-file.response.dto';
import { PresignedUrlResponse } from '../dto/responses/presigned-url.response.dto';
import { DeleteFileResponse } from '../dto/responses/delete-file.response.dto';
import { ValidationError } from '../../../shared/errors/validation.error';
import { ErrorResponse } from '../../../shared/dto/error.response.dto';

@ApiTags('Files - Gestión de archivos con MinIO')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload/:fileType')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ 
    summary: 'Subir un archivo a MinIO',
    description: 'Sube una imagen o modelo 3D (.glb) a MinIO y retorna la información del archivo con URL presigned'
  })
  @ApiParam({ 
    name: 'fileType', 
    enum: ['image', 'model'],
    description: 'Tipo de archivo a subir'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo a subir (imagen: jpeg/jpg/png/webp/gif máx 10MB, modelo: .glb/.gltf máx 50MB)',
        },
      },
    },
  })
  @ApiCreatedResponse({ 
    description: 'Archivo subido exitosamente',
    type: UploadFileResponse
  })
  @ApiBadRequestResponse({ 
    type: ErrorResponse,
    description: 'Tipo de archivo no válido, tamaño excedido o no se proporcionó archivo' 
  })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('fileType') fileType: 'image' | 'model',
  ): Promise<UploadFileResponse> {
    if (!file) {
      throw new ValidationError('No se ha proporcionado ningún archivo');
    }

    if (fileType !== 'image' && fileType !== 'model') {
      throw new ValidationError('fileType debe ser "image" o "model"', { fileType });
    }

    const result = await this.filesService.uploadFile(file, fileType);

    return {
      message: 'Archivo subido exitosamente',
      fileName: result.fileName,
      bucket: result.bucket,
      url: result.url,
    };
  }

  @Get('presigned-url')
  @ApiOperation({ 
    summary: 'Generar URL presigned para descargar un archivo',
    description: 'Genera una URL temporal para acceder a un archivo almacenado en MinIO'
  })
  @ApiQuery({ 
    name: 'fileType', 
    enum: ['image', 'model'],
    description: 'Tipo de archivo'
  })
  @ApiQuery({ 
    name: 'fileName',
    description: 'Nombre del archivo en MinIO',
    example: '1738996800000-photo.jpg'
  })
  @ApiQuery({ 
    name: 'expirySeconds',
    required: false,
    description: 'Tiempo de expiración en segundos (por defecto 86400 = 24 horas)',
    example: 86400
  })
  @ApiOkResponse({ 
    description: 'URL presigned generada exitosamente',
    type: PresignedUrlResponse
  })
  @ApiNotFoundResponse({ 
    type: ErrorResponse,
    description: 'Archivo no encontrado en el bucket especificado' 
  })
  async generatePresignedUrl(
    @Query() query: GeneratePresignedUrlRequest,
  ): Promise<PresignedUrlResponse> {
    const buckets = this.filesService.getBuckets();
    const bucket = query.fileType === 'image' ? buckets.images : buckets.models;

    return await this.filesService.generatePresignedGetUrl(
      bucket,
      query.fileName,
      query.expirySeconds,
    );
  }

  @Get('presigned-put-url/:fileType/:fileName')
  @ApiOperation({ 
    summary: 'Generar URL presigned para subir archivo directamente desde el cliente',
    description: 'Genera una URL temporal que permite al cliente subir un archivo directamente a MinIO sin pasar por el servidor'
  })
  @ApiParam({ 
    name: 'fileType', 
    enum: ['image', 'model'],
    description: 'Tipo de archivo'
  })
  @ApiParam({ 
    name: 'fileName',
    description: 'Nombre del archivo a subir',
    example: '1738996800000-photo.jpg'
  })
  @ApiQuery({ 
    name: 'expirySeconds',
    required: false,
    description: 'Tiempo de expiración en segundos (por defecto 3600 = 1 hora)',
    example: 3600
  })
  @ApiOkResponse({ 
    description: 'URL presigned PUT generada exitosamente',
    type: PresignedUrlResponse
  })
  @ApiBadRequestResponse({ 
    type: ErrorResponse,
    description: 'fileType debe ser "image" o "model"' 
  })
  async generatePresignedPutUrl(
    @Param('fileType') fileType: 'image' | 'model',
    @Param('fileName') fileName: string,
    @Query('expirySeconds') expirySeconds?: number,
  ): Promise<PresignedUrlResponse> {
    if (fileType !== 'image' && fileType !== 'model') {
      throw new ValidationError('fileType debe ser "image" o "model"', { fileType });
    }

    const buckets = this.filesService.getBuckets();
    const bucket = fileType === 'image' ? buckets.images : buckets.models;

    return await this.filesService.generatePresignedPutUrl(
      bucket,
      fileName,
      expirySeconds || 3600,
    );
  }

  @Delete(':fileType/:fileName')
  @ApiOperation({ 
    summary: 'Eliminar un archivo de MinIO',
    description: 'Elimina permanentemente un archivo del almacenamiento de MinIO'
  })
  @ApiParam({ 
    name: 'fileType', 
    enum: ['image', 'model'],
    description: 'Tipo de archivo'
  })
  @ApiParam({ 
    name: 'fileName',
    description: 'Nombre del archivo a eliminar',
    example: '1738996800000-photo.jpg'
  })
  @ApiOkResponse({ 
    description: 'Archivo eliminado exitosamente',
    type: DeleteFileResponse
  })
  @ApiNotFoundResponse({ 
    type: ErrorResponse,
    description: 'Archivo no encontrado en el bucket especificado' 
  })
  @ApiBadRequestResponse({ 
    type: ErrorResponse,
    description: 'fileType debe ser "image" o "model"' 
  })
  async deleteFile(
    @Param('fileType') fileType: 'image' | 'model',
    @Param('fileName') fileName: string,
  ): Promise<DeleteFileResponse> {
    if (fileType !== 'image' && fileType !== 'model') {
      throw new ValidationError('fileType debe ser "image" o "model"', { fileType });
    }

    const buckets = this.filesService.getBuckets();
    const bucket = fileType === 'image' ? buckets.images : buckets.models;

    await this.filesService.deleteFile(bucket, fileName);

    return {
      message: 'Archivo eliminado exitosamente',
      fileName,
    };
  }
}
