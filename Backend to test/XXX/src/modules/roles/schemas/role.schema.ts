import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { RoleScope } from '@common/enums/role-scope.enum';

export type RoleDocument = HydratedDocument<Role>;

@Schema({ _id: false })
export class RolePermissionMapping {
  @ApiProperty({ type: String })
  @Prop({ type: Types.ObjectId, ref: 'Permission', required: true })
  permission: Types.ObjectId;

  @ApiProperty({
    default: false,
    description:
      'true = cannot be disabled within THIS role (checkbox greyed out). Only applicable when isSystemRole = true.',
  })
  @Prop({ default: false })
  isDefault: boolean;
}

export const RolePermissionMappingSchema =
  SchemaFactory.createForClass(RolePermissionMapping);
@Schema({ timestamps: true, collection: 'roles' })
export class Role {
  @ApiProperty({
    required: false,
    description:
      'Optional human-readable label. Seed data does NOT populate this field — the slug is the i18n key and the frontend resolves the label. Kept here for runtime-created custom roles.',
  })
  @Prop()
  name?: string;

  @ApiProperty({ example: 'KINE' })
  @Prop({ required: true, unique: true, index: true })
  slug: string;

  @ApiProperty({
    required: false,
    description: 'Optional free-text description. Same i18n contract as `name`.',
  })
  @Prop()
  description?: string;

  @ApiProperty({
    default: false,
    description: 'true = seeded, not deletable',
  })
  @Prop({ default: false, index: true })
  isSystemRole: boolean;

  @ApiProperty({
    enum: RoleScope,
    description: 'Informational label only — no security logic branches on this value.',
  })
  @Prop({ type: String, required: true, enum: Object.values(RoleScope), index: true })
  scope: RoleScope;

  @ApiProperty({
    type: String,
    required: false,
    nullable: true,
    description:
      'Reference to a parent role (inheritance, system roles only). Not exposed in the admin UI for custom roles.',
  })
  @Prop({ type: Types.ObjectId, ref: 'Role', default: null })
  parentRoleId: Types.ObjectId | null;

  @ApiProperty({ type: [RolePermissionMapping] })
  @Prop({ type: [RolePermissionMappingSchema], default: [] })
  permissionIds: RolePermissionMapping[];

  @ApiProperty({ default: true })
  @Prop({ default: true, index: true })
  isActive: boolean;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
