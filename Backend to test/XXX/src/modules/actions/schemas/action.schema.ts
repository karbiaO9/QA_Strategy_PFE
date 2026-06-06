import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ActionDocument = HydratedDocument<Action>;

@Schema({ timestamps: true, collection: 'actions' })
export class Action {
  @ApiProperty({
    required: false,
    description:
      'Optional human-readable label. Seed data does NOT populate this field — the slug is the i18n key and the frontend resolves the label. Kept here for runtime-created actions.',
  })
  @Prop()
  name?: string;

  @ApiProperty({
    example: 'READ',
    description: 'UNIQUE, UPPER_SNAKE_CASE. Must match CaslAction enum.',
  })
  @Prop({ required: true, unique: true, index: true })
  slug: string;

  @ApiProperty({
    required: false,
    description: 'Optional free-text description. Same i18n contract as `name`.',
  })
  @Prop()
  description?: string;

  @ApiProperty({ default: true })
  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
}

export const ActionSchema = SchemaFactory.createForClass(Action);

// Index compound pour filtrer les actions actives
ActionSchema.index({ isActive: 1, deletedAt: 1 });
