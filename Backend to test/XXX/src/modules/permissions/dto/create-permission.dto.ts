import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({
    required: false,
    description: 'Optional human-readable label. If omitted the code is used as the i18n key.',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'manage_patients' })
  @IsString()
  code: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: '6612a3f5e4b0c1a2d3f4e5a6',
    description: 'ObjectId du Module',
  })
  @IsMongoId()
  moduleId: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsMongoId({ each: true })
  actionIds: string[];

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsMongoId()
  parentPermissionId?: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  conditions?: Record<string, any>;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fields?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  inverted?: boolean;
}
