import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateActionDto {
  @ApiProperty({
    required: false,
    description: 'Optional human-readable label. If omitted the slug is used as the i18n key.',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'view' })
  @IsString()
  slug: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
