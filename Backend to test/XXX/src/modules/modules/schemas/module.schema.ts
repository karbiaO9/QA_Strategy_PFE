import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ModuleDocument = HydratedDocument<Module>;


@Schema({ timestamps: true, collection: 'modules' })
export class Module {
  @ApiProperty({
    required: false,
    description:
      'Optional human-readable label. Seed data does NOT populate this field — the slug is the i18n key and the frontend resolves the label. Kept here for runtime-created modules.',
  })
  @Prop()
  name?: string;

  @ApiProperty({
    example: 'PATIENT',
    description: 'UNIQUE, UPPER_SNAKE_CASE. Must match CaslSubject enum.',
  })
  @Prop({ required: true, unique: true, index: true })
  slug: string;

  @ApiProperty({
    required: false,
    description: 'Optional free-text description. Same i18n contract as `name`.',
  })
  @Prop()
  description?: string;

  @ApiProperty({
    required: false,
    example: 'users',
    description: "Nom d'icone lucide-react pour l'affichage en carte",
  })
  @Prop()
  icon?: string;

  @ApiProperty({
    example: 'core',
    enum: ['identity', 'core', 'notification', 'analytics', 'billing'],
  })
  @Prop({ required: true, index: true })
  microservice: string;

  @ApiProperty({ default: true })
  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
}

export const ModuleSchema = SchemaFactory.createForClass(Module);

ModuleSchema.index({ isActive: 1, deletedAt: 1 });
