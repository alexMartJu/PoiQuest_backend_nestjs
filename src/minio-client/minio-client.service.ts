import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

export interface UploadFileResult {
  fileName: string;
  bucket: string;
  url?: string;
}

export interface PresignedUrlResult {
  url: string;
  expiresIn: number;
}

@Injectable()
export class MinioClientService implements OnModuleInit {
  private readonly logger = new Logger(MinioClientService.name);
  private minioClient: Minio.Client;
  private readonly imagesBucket = 'images';
  private readonly modelsBucket = 'models';

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get<string>('MINIO_ENDPOINT') || 'minio';
    const port = parseInt(this.configService.get<string>('MINIO_PORT') || '9000');
    const useSSL = this.configService.get<string>('MINIO_USE_SSL') === 'true';
    const accessKey = this.configService.get<string>('MINIO_ACCESS_KEY') || 'minioadmin';
    const secretKey = this.configService.get<string>('MINIO_SECRET_KEY') || 'minioadmin';

    this.minioClient = new Minio.Client({
      endPoint: endpoint,
      port: port,
      useSSL: useSSL,
      accessKey: accessKey,
      secretKey: secretKey,
    });
  }

  async onModuleInit() {
    await this.ensureBucketsExist();
  }

  /**
   * Crea los buckets necesarios si no existen
   */
  private async ensureBucketsExist() {
    const buckets = [this.imagesBucket, this.modelsBucket];
    
    for (const bucket of buckets) {
      try {
        const exists = await this.minioClient.bucketExists(bucket);
        if (!exists) {
          await this.minioClient.makeBucket(bucket, 'us-east-1');
          this.logger.log(`Bucket '${bucket}' creado exitosamente`);
        }
      } catch (error) {
        this.logger.error(`Error al crear/verificar bucket '${bucket}':`, error);
      }
    }
  }

  /**
   * Sube un archivo según su tipo
   * @param file - Archivo de Express.Multer.File
   * @param type - Tipo de archivo: 'image' o 'model'
   * @returns Resultado con el nombre del archivo y bucket
   */
  async uploadFile(
    file: Express.Multer.File,
    type: 'image' | 'model',
  ): Promise<UploadFileResult> {
    const bucket = type === 'image' ? this.imagesBucket : this.modelsBucket;
    const timestamp = Date.now();
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${timestamp}-${sanitizedName}`;

    try {
      await this.minioClient.putObject(
        bucket,
        fileName,
        file.buffer,
        file.size,
        {
          'Content-Type': file.mimetype,
        },
      );

      this.logger.log(`Archivo subido: ${fileName} en bucket ${bucket}`);

      return {
        fileName,
        bucket,
      };
    } catch (error) {
      this.logger.error(`Error al subir archivo ${fileName}:`, error);
      throw new Error(`Error al subir archivo: ${error.message}`);
    }
  }

  /**
   * Genera una URL presigned para descargar un archivo
   * @param bucket - Nombre del bucket
   * @param fileName - Nombre del archivo
   * @param expirySeconds - Tiempo de expiración en segundos (por defecto 24 horas)
   * @returns URL presigned y tiempo de expiración
   */
  async getPresignedUrl(
    bucket: string,
    fileName: string,
    expirySeconds: number = 86400, // 24 horas por defecto
  ): Promise<PresignedUrlResult> {
    try {
      const url = await this.minioClient.presignedGetObject(
        bucket,
        fileName,
        expirySeconds,
      );

      return {
        url,
        expiresIn: expirySeconds,
      };
    } catch (error) {
      this.logger.error(`Error al generar URL presigned para ${fileName}:`, error);
      throw new Error(`Error al generar URL presigned: ${error.message}`);
    }
  }

  /**
   * Genera una URL presigned para subir un archivo directamente desde el cliente
   * @param bucket - Nombre del bucket
   * @param fileName - Nombre del archivo
   * @param expirySeconds - Tiempo de expiración en segundos (por defecto 1 hora)
   * @returns URL presigned para PUT
   */
  async getPresignedPutUrl(
    bucket: string,
    fileName: string,
    expirySeconds: number = 3600, // 1 hora por defecto
  ): Promise<PresignedUrlResult> {
    try {
      const url = await this.minioClient.presignedPutObject(
        bucket,
        fileName,
        expirySeconds,
      );

      return {
        url,
        expiresIn: expirySeconds,
      };
    } catch (error) {
      this.logger.error(`Error al generar URL presigned PUT para ${fileName}:`, error);
      throw new Error(`Error al generar URL presigned PUT: ${error.message}`);
    }
  }

  /**
   * Elimina un archivo del bucket
   * @param bucket - Nombre del bucket
   * @param fileName - Nombre del archivo
   */
  async deleteFile(bucket: string, fileName: string): Promise<void> {
    try {
      await this.minioClient.removeObject(bucket, fileName);
      this.logger.log(`Archivo eliminado: ${fileName} del bucket ${bucket}`);
    } catch (error) {
      this.logger.error(`Error al eliminar archivo ${fileName}:`, error);
      throw new Error(`Error al eliminar archivo: ${error.message}`);
    }
  }

  /**
   * Elimina múltiples archivos del bucket
   * @param bucket - Nombre del bucket
   * @param fileNames - Lista de nombres de archivos
   */
  async deleteFiles(bucket: string, fileNames: string[]): Promise<void> {
    try {
      await this.minioClient.removeObjects(bucket, fileNames);
      this.logger.log(`${fileNames.length} archivos eliminados del bucket ${bucket}`);
    } catch (error) {
      this.logger.error(`Error al eliminar archivos:`, error);
      throw new Error(`Error al eliminar archivos: ${error.message}`);
    }
  }

  /**
   * Obtiene el stream de un archivo
   * @param bucket - Nombre del bucket
   * @param fileName - Nombre del archivo
   * @returns Stream del archivo
   */
  async getFileStream(bucket: string, fileName: string) {
    try {
      return await this.minioClient.getObject(bucket, fileName);
    } catch (error) {
      this.logger.error(`Error al obtener stream de ${fileName}:`, error);
      throw new Error(`Error al obtener archivo: ${error.message}`);
    }
  }

  /**
   * Verifica si un archivo existe en el bucket
   * @param bucket - Nombre del bucket
   * @param fileName - Nombre del archivo
   * @returns True si existe, false si no
   */
  async fileExists(bucket: string, fileName: string): Promise<boolean> {
    try {
      await this.minioClient.statObject(bucket, fileName);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtiene los nombres de los buckets
   */
  getBuckets() {
    return {
      images: this.imagesBucket,
      models: this.modelsBucket,
    };
  }
}
