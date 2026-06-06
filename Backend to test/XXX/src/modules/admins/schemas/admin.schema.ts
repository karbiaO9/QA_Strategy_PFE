import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type AdminDocument = HydratedDocument<Admin>;


@Schema({ timestamps: true, collection: 'admins' })
export class Admin {
  @ApiProperty({ example: 'Thomas' })
  @Prop({ required: true })
  firstName: string;

  @ApiProperty({ example: 'Platform' })
  @Prop({ required: true })
  lastName: string;

  @ApiProperty({ example: 'admin@physioconnect.com' })
  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  })
  email: string;

  @Prop({ required: true, select: false })
  passwordHash: string;

  @ApiProperty({
    required: false,
    description: 'URL photo de profil (CDN)',
  })
  @Prop()
  profilePhoto?: string;

  @ApiProperty({
    type: String,
    description: 'ObjectId du Role (doit etre isSystemRole = true)',
  })
  @Prop({ type: Types.ObjectId, ref: 'Role', required: true, index: true })
  roleId: Types.ObjectId;

  @ApiProperty({
    enum: ['ACTIVE', 'INACTIVE'],
    description: 'INACTIVE = compte suspendu, login bloque',
  })
  @Prop({
    required: true,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE',
    index: true,
  })
  status: 'ACTIVE' | 'INACTIVE';

  @ApiProperty({
    required: false,
    description: 'UTC timestamp du dernier login reussi',
  })
  @Prop({ type: Date, default: null })
  lastLoginAt?: Date;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
