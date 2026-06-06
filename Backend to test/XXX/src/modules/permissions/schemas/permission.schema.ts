import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type PermissionDocument = HydratedDocument<Permission>;


@Schema({ timestamps: true, collection: 'permissions' })
export class Permission {
  @ApiProperty({
    required: false,
    description:
      'Optional human-readable label. Seed data does NOT populate this field — the code is the i18n key and the frontend resolves the label. Kept here for runtime-created permissions.',
  })
  @Prop()
  name?: string;

  @ApiProperty({
    example: 'manage_patients',
    description: 'UNIQUE technical identifier',
  })
  @Prop({ required: true, unique: true, index: true })
  code: string;

  @ApiProperty({
    required: false,
    description: 'Optional free-text description. Same i18n contract as `name`.',
  })
  @Prop()
  description?: string;

  @ApiProperty({
    type: String,
    description: 'ObjectId du Module (1 seul, obligatoire)',
  })
  @Prop({ type: Types.ObjectId, ref: 'Module', required: true, index: true })
  moduleId: Types.ObjectId;

  @ApiProperty({ type: [String], description: 'ObjectIds des Actions incluses' })
  @Prop({ type: [Types.ObjectId], ref: 'Action', default: [] })
  actionIds: Types.ObjectId[];

  @ApiProperty({
    type: String,
    required: false,
    nullable: true,
    description: 'Permission parent (null si racine)',
  })
  @Prop({
    type: Types.ObjectId,
    ref: 'Permission',
    default: null,
    index: true,
  })
  parentPermissionId: Types.ObjectId | null;


  @ApiProperty({
    required: false,
    description:
      'Conditions MongoDB CASL pour des regles avancees. V1 : non utilise.',
  })
  @Prop({ type: Object, default: null })
  conditions?: Record<string, any>;

  @ApiProperty({
    required: false,
    type: [String],
    description:
      'Restriction a certains champs du document. V1 : non utilise.',
  })
  @Prop({ type: [String], default: null })
  fields?: string[];

  @ApiProperty({
    required: false,
    default: false,
    description:
      'true = regle de deni CASL (cannot). V1 : non utilise.',
  })
  @Prop({ default: null })
  inverted?: boolean;

  @ApiProperty({ default: true })
  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);

PermissionSchema.index({ moduleId: 1, isActive: 1, deletedAt: 1 });
