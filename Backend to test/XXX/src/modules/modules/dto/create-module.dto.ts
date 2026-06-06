import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class CreateModuleDto {
  @ApiProperty({
    required: false,
    description: 'Optional human-readable label. If omitted the slug is used as the i18n key.',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'PATIENT' })
  @IsString()
  slug: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, example: 'users' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ enum: ['identity', 'core', 'notification', 'analytics', 'billing'] })
  @IsIn(['identity', 'core', 'notification', 'analytics', 'billing'])
  microservice: string;
}
