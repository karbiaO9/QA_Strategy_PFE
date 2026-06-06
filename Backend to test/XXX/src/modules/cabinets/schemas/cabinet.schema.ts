import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { DiscountType } from '@common/enums/discount-type.enum';

export type CabinetDocument = HydratedDocument<Cabinet>;

@Schema({ timestamps: true, collection: 'cabinets' })
export class Cabinet {
  @ApiProperty({ example: 'Cabinet de Ali Dupont' })
  @Prop({ required: true })
  name: string;

  @ApiProperty({
    type: String,
    description:
      "ObjectId du kine proprietaire du cabinet (celui qui l'a cree). Transferable manuellement via CSM.",
  })
  @Prop({ type: Types.ObjectId, ref: 'Kine', required: true, index: true })
  ownerId: Types.ObjectId;

  @ApiProperty({ example: '123 Rue de Paris, 75001 Paris' })
  @Prop({ required: false })
  address?: string;

  @ApiProperty({ example: 'Europe/Paris', default: 'Europe/Paris' })
  @Prop({ default: 'Europe/Paris' })
  timezone: string;

  @ApiProperty({ example: 'FR', default: 'FR' })
  @Prop({ default: 'FR' })
  country: string;

  @ApiProperty({ example: 'Cabinet Dupont SAS' })
  @Prop({ required: false })
  legalName?: string;

  @ApiProperty({ example: 'FR12345678901' })
  @Prop({ required: false })
  taxRegistrationNumber?: string;

  @ApiProperty({ type: String, required: false })
  @Prop({ type: Types.ObjectId, ref: 'Subscription' })
  planSnapshotId?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop()
  commercialContact?: string;

  @ApiProperty({ required: false })
  @Prop({
    type: {
      type: String,
      enum: Object.values(DiscountType),
    },
    value: Number,
  })
  discount?: {
    type: DiscountType;
    value: number;
  };

  @ApiProperty({ default: true })
  @Prop({ default: true, index: true })
  isActive: boolean;
}

export const CabinetSchema = SchemaFactory.createForClass(Cabinet);
