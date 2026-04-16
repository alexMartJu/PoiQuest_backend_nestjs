import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ScanPoiRequest {
  @ApiProperty({ description: 'UUID del punto de interés a escanear' })
  @IsNotEmpty()
  @IsString()
  poiUuid!: string;

  @ApiProperty({ description: 'UUID del ticket del usuario' })
  @IsNotEmpty()
  @IsString()
  ticketUuid!: string;
}
