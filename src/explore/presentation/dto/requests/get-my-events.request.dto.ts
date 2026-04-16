import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export enum ExploreTicketStatus {
  ACTIVE = 'active',
  USED = 'used',
}

export class GetMyEventsRequest {
  @ApiProperty({
    enum: ExploreTicketStatus,
    description: 'Estado de los tickets a filtrar',
    example: 'active',
  })
  @IsEnum(ExploreTicketStatus)
  status!: ExploreTicketStatus;

  @ApiPropertyOptional({
    description: 'Cursor para paginación (ID del último ticket de la página anterior)',
    example: '42',
  })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({
    description: 'Número máximo de items por página. Default 4',
    example: 4,
    default: 4,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 4;
}
