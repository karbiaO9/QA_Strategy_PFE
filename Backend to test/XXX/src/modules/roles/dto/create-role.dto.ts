import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { RoleScope } from '@common/enums/role-scope.enum';

export class RolePermissionMappingDto {
  @ApiProperty({ example: '6612a3f5e4b0c1a2d3f4e5a6' })
  @IsMongoId()
  permission: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class CreateRoleDto {
  @ApiProperty({
    required: false,
    description: 'Optional human-readable label. If omitted the slug is used as the i18n key.',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'KINE' })
  @IsString()
  slug: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isSystemRole?: boolean;

  @ApiProperty({ enum: RoleScope })
  @IsEnum(RoleScope)
  scope: RoleScope;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsMongoId()
  parentRoleId?: string | null;

  @ApiProperty({ type: [RolePermissionMappingDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RolePermissionMappingDto)
  permissionIds: RolePermissionMappingDto[];
}
