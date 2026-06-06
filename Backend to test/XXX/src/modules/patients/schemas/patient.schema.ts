import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type PatientDocument = HydratedDocument<Patient>;

export type PatientSource = 'real' | 'fictif';

@Schema({ timestamps: true, collection: 'patients' })
export class Patient {
  @ApiProperty({ example: 'marie.durand@patient.fr' })
  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  })
  email: string;

  @Prop({ required: false, select: false })
  passwordHash?: string;

  @ApiProperty({ example: 'Marie' })
  @Prop({ required: true })
  firstName: string;

  @ApiProperty({ example: 'Durand' })
  @Prop({ required: true })
  lastName: string;

  @ApiProperty({
    type: String,
    description: 'ObjectId du Role — toujours PATIENT',
  })
  @Prop({ type: Types.ObjectId, ref: 'Role', required: true })
  roleId: Types.ObjectId;

  @ApiProperty({
    type: String,
    description: 'ObjectId du Cabinet',
  })
  @Prop({ type: Types.ObjectId, ref: 'Cabinet', index: true, required: false })
  cabinetId?: Types.ObjectId;

  @ApiProperty({
    required: false,
    description:
      'ObjectId du kine proprietaire. Cle CASL uniforme pour les permissions restreintes.',
  })
  @Prop({ type: Types.ObjectId, ref: 'Kine', default: null, index: true })
  ownerId?: Types.ObjectId | null;

  @ApiProperty({
    description: 'Code unique de liaison 12 char [A-Z0-9]',
  })
  @Prop({ required: true, unique: true, index: true })
  uniqueCode: string;

  @ApiProperty({ required: false })
  @Prop()
  dateOfBirth?: Date;

  @ApiProperty({ required: false })
  @Prop()
  address?: string;

  @ApiProperty({ example: 'Europe/Paris', default: 'Europe/Paris' })
  @Prop({ default: 'Europe/Paris' })
  timezone: string;

  @ApiProperty({ example: 'fr', default: 'fr' })
  @Prop({ default: 'fr' })
  language: string;

  @ApiProperty({ enum: ['NEW', 'ACTIVE', 'INACTIVE'], default: 'NEW' })
  @Prop({
    required: true,
    enum: ['NEW', 'ACTIVE', 'INACTIVE'],
    default: 'NEW',
    index: true,
  })
  status: 'NEW' | 'ACTIVE' | 'INACTIVE';

  @ApiProperty({ required: false })
  @Prop()
  linkedAt?: Date;

  @ApiProperty({ type: String, required: false })
  @Prop({ type: Types.ObjectId, ref: 'Kine' })
  linkedByKineId?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({
    type: {
      provider: { type: String, enum: ['GOOGLE', 'APPLE'] },
      providerId: String,
    },
  })
  oauth?: {
    provider: 'GOOGLE' | 'APPLE';
    providerId: string;
  };

  @ApiProperty({ type: String, required: false })
  @Prop({ type: Types.ObjectId, ref: 'PatientSubscription' })
  subscriptionId?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop()
  lastLoginAt?: Date;

  @ApiProperty({ required: false, description: 'Telephone (peut se logger avec)' })
  @Prop({ index: true, sparse: true })
  phone?: string;

  @ApiProperty({ required: false })
  @Prop()
  profilePhoto?: string;

  @ApiProperty({
    enum: ['real', 'fictif'],
    default: 'real',
    description:
      'Provenance du patient. `fictif` = sandbox provisionne pour un kine STUDENT (ou template seed). `real` = patient reel.',
  })
  @Prop({
    type: String,
    enum: ['real', 'fictif'],
    default: 'real',
    index: true,
  })
  source: PatientSource;

  @ApiProperty({
    default: false,
    description:
      'Vrai uniquement pour les 5 templates fictif master, jamais visibles dans les listings applicatifs (ils sont clones par kine STUDENT).',
  })
  @Prop({ default: false, index: true })
  isTemplate: boolean;

  @ApiProperty({
    type: String,
    required: false,
    description:
      'Sur un patient fictif clone : pointe vers le template Patient dont il provient (analytics, futurs resets).',
  })
  @Prop({ type: Types.ObjectId, ref: 'Patient', default: null })
  templateId?: Types.ObjectId | null;

  @ApiProperty({
    type: String,
    required: false,
    description:
      'Code stable utilise par le seed pour identifier un template fictif (idempotent upsert key). Pose uniquement sur isTemplate=true.',
  })
  @Prop({ type: String, default: null, sparse: true, index: true })
  templateCode?: string | null;
}

export const PatientSchema = SchemaFactory.createForClass(Patient);

// Strip `isTemplate: true` rows from every read so app code can't leak
// fictif templates. Pass `.setOptions({ includeTemplates: true })` to opt in
// (seed, startup health check, clone helper).
const TEMPLATE_READ_HOOKS = [
  'count',
  'countDocuments',
  'estimatedDocumentCount',
  'find',
  'findOne',
  'findOneAndDelete',
  'findOneAndRemove',
  'findOneAndReplace',
  'findOneAndUpdate',
  'replaceOne',
  'distinct',
] as const;

const TEMPLATE_WRITE_HOOKS = [
  'updateOne',
  'updateMany',
  'deleteOne',
  'deleteMany',
] as const;

function applyTemplateExclusion(query: any): void {
  const opts = query.getOptions?.() ?? {};
  if (opts.includeTemplates === true) return;
  const filter = query.getFilter();
  if (filter.isTemplate === undefined) {
    query.where({ isTemplate: { $ne: true } });
  }
}

for (const hook of TEMPLATE_READ_HOOKS) {
  PatientSchema.pre(hook as any, function (this: any) {
    applyTemplateExclusion(this);
  });
}
for (const hook of TEMPLATE_WRITE_HOOKS) {
  PatientSchema.pre(hook as any, function (this: any) {
    applyTemplateExclusion(this);
  });
}

PatientSchema.pre('aggregate', function (this: any) {
  const opts = this.options ?? {};
  if (opts.includeTemplates === true) return;
  const pipeline = this.pipeline();
  pipeline.unshift({ $match: { isTemplate: { $ne: true } } });
});
