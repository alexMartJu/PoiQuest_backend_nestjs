import { Injectable } from '@nestjs/common';
import { MinioClientService } from '../../../minio-client/minio-client.service';
import { ValidationError } from '../../../shared/errors/validation.error';
import { NotFoundError } from '../../../shared/errors/not-found.error';

@Injectable()
export class FilesService {
  constructor(private readonly minioClient: MinioClientService) {}

  /**
   * Sube un archivo a MinIO
   * @param file - Archivo de Express.Multer.File
   * @param fileType - Tipo de archivo: 'image' o 'model'
   * @returns Información del archivo subido con URL presigned
   */
  async uploadFile(file: Express.Multer.File, fileType: 'image' | 'model') {
    // Validar tipo de archivo
    this.validateFileType(file, fileType);

    // Subir archivo a MinIO
    const result = await this.minioClient.uploadFile(file, fileType);

    // Generar URL presigned para acceder al archivo
    const presignedUrl = await this.minioClient.getPresignedUrl(
      result.bucket,
      result.fileName,
      86400, // 24 horas
    );

    return {
      fileName: result.fileName,
      bucket: result.bucket,
      url: presignedUrl.url,
    };
  }

  /**
   * Genera una URL presigned para descargar un archivo
   * @param bucket - Nombre del bucket
   * @param fileName - Nombre del archivo
   * @param expirySeconds - Tiempo de expiración en segundos
   * @returns URL presigned y tiempo de expiración
   */
  async generatePresignedGetUrl(
    bucket: string,
    fileName: string,
    expirySeconds: number = 86400,
  ) {
    // Verificar que el archivo existe
    const exists = await this.minioClient.fileExists(bucket, fileName);
    if (!exists) {
      throw new NotFoundError(`Archivo ${fileName} no encontrado en bucket ${bucket}`, { bucket, fileName });
    }

    return await this.minioClient.getPresignedUrl(bucket, fileName, expirySeconds);
  }

  /**
   * Genera una URL presigned para subir un archivo directamente desde el cliente
   * @param bucket - Nombre del bucket
   * @param fileName - Nombre del archivo
   * @param expirySeconds - Tiempo de expiración en segundos
   * @returns URL presigned PUT y tiempo de expiración
   */
  async generatePresignedPutUrl(
    bucket: string,
    fileName: string,
    expirySeconds: number = 3600,
  ) {
    return await this.minioClient.getPresignedPutUrl(bucket, fileName, expirySeconds);
  }

  /**
   * Elimina un archivo de MinIO
   * @param bucket - Nombre del bucket
   * @param fileName - Nombre del archivo
   */
  async deleteFile(bucket: string, fileName: string) {
    // Verificar que el archivo existe
    const exists = await this.minioClient.fileExists(bucket, fileName);
    if (!exists) {
      throw new NotFoundError(`Archivo ${fileName} no encontrado en bucket ${bucket}`, { bucket, fileName });
    }

    await this.minioClient.deleteFile(bucket, fileName);
  }

  /**
   * Genera URLs presigned para múltiples archivos
   * @param files - Array de objetos con bucket y fileName
   * @param expirySeconds - Tiempo de expiración en segundos
   * @returns Map de fileId a URL presigned
   */
  async generatePresignedUrlsForFiles(
    files: Array<{ id: number; bucket: string; fileName: string }>,
    expirySeconds: number = 86400,
  ): Promise<Map<number, string>> {
    const urlMap = new Map<number, string>();

    for (const file of files) {
      try {
        const result = await this.minioClient.getPresignedUrl(
          file.bucket,
          file.fileName,
          expirySeconds,
        );
        urlMap.set(file.id, result.url);
      } catch (error) {
        // Si falla, simplemente no añadimos la URL al map
        console.error(`Error al generar URL presigned para archivo ${file.fileName}:`, error);
      }
    }

    return urlMap;
  }

  /**
   * Valida el tipo de archivo según el tipo esperado
   */
  private validateFileType(file: Express.Multer.File, fileType: 'image' | 'model') {
    if (fileType === 'image') {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.mimetype)) {
        throw new ValidationError(
          `Tipo de archivo no válido. Se esperaba una imagen (jpeg, jpg, png, webp, gif), se recibió: ${file.mimetype}`,
          { mimetype: file.mimetype, allowedTypes }
        );
      }

      // Validar tamaño máximo de 10MB para imágenes
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new ValidationError(
          `El tamaño del archivo excede el límite de 10MB. Tamaño recibido: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
          { maxSize, receivedSize: file.size }
        );
      }
    } else if (fileType === 'model') {
      const allowedTypes = ['model/gltf-binary', 'application/octet-stream'];
      const allowedExtensions = ['.glb', '.gltf'];

      const hasValidMimetype = allowedTypes.includes(file.mimetype);
      const hasValidExtension = allowedExtensions.some(ext => 
        file.originalname.toLowerCase().endsWith(ext)
      );

      if (!hasValidMimetype && !hasValidExtension) {
        throw new ValidationError(
          `Tipo de archivo no válido. Se esperaba un modelo 3D (.glb, .gltf), se recibió: ${file.originalname}`,
          { mimetype: file.mimetype, fileName: file.originalname, allowedExtensions }
        );
      }

      // Validar tamaño máximo de 50MB para modelos 3D
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        throw new ValidationError(
          `El tamaño del archivo excede el límite de 50MB. Tamaño recibido: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
          { maxSize, receivedSize: file.size }
        );
      }
    }
  }

  /**
   * Obtiene los nombres de los buckets disponibles
   */
  getBuckets() {
    return this.minioClient.getBuckets();
  }
}
