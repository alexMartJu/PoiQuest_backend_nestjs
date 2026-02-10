import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class GeneratePresignedUrlRequest {
  @ApiProperty({ 
    description: 'Tipo de archivo',
    enum: ['image', 'model'],
    example: 'image'
  })
  @IsEnum(['image', 'model'])
  fileType!: 'image' | 'model';

  @ApiProperty({ 
    description: 'Nombre del archivo en MinIO',
    example: '1738996800000-photo.jpg'
  })
  fileName!: string;

  @ApiPropertyOptional({ 
    description: 'Tiempo de expiración en segundos (por defecto 86400 = 24 horas, máximo 604800 = 7 días)',
    example: 86400,
    minimum: 60,
    maximum: 604800
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(60)
  @Max(604800)
  expirySeconds?: number = 86400;
}
