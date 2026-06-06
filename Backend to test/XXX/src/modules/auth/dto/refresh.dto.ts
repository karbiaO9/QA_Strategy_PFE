import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshDto {
  @ApiProperty({
    example: 'rt_abc...',
    description: 'Refresh token obtenu lors du login',
  })
  @IsString()
  refreshToken: string;
}
