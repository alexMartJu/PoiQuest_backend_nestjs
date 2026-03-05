import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsISO8601, IsPositive, IsInt, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PartnerStatus } from '../../../domain/enums/partner-status.enum';

export class PartnerCursorPaginationRequest {
  @ApiPropertyOptional({
    description: 'Cursor (createdAt del último elemento de la página anterior en formato ISO 8601)',
    example: '2025-03-09T12:34:56.000Z',
  })
  @IsOptional()
  @IsString()
  @IsISO8601()
  cursor?: string;

  @ApiPropertyOptional({
    description: 'Número máximo de items por página. Default 10',
    minimum: 1,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  limit?: number;

  @ApiPropertyOptional({
    enum: PartnerStatus,
    description: 'Filtrar por estado. Si no se indica, se devuelven todos los registros activos.',
    example: PartnerStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(PartnerStatus)
  status?: PartnerStatus;
}
