import { IsString, IsUrl, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAvatarRequest {
  @ApiProperty({ 
    maxLength: 255, 
    description: 'URL del nuevo avatar',
    example: 'https://example.com/avatar.jpg'
  })
  @IsString()
  @IsUrl()
  @MaxLength(255)
  avatarUrl!: string;
}
