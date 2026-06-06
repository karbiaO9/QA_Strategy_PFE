import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

import {
  PermissionOverride,
  PermissionOverrideSchema,
  ProfileFreemium,
  ProfileFreemiumSchema,
  PROFILE_TYPES,
} from '../../kines/schemas/kine.schema';
// `import type` for the alias — keeps the Docker build (isolatedModules) happy.
import type { ProfileType } from '../../kines/schemas/kine.schema';

export type KineProfileDocument = HydratedDocument<KineProfile>;

// One row per kine profile. Each row points back to its owning Kine via
// `kineId`. This was extracted out of the embedded `Kine.profiles[]` array.
@Schema({
  timestamps: true,
  collection: 'kineprofiles',
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class KineProfile {
  @ApiProperty({
    type: String,
    description:
      'Backref to the owning Kine account (L1). Indexed because every ' +
      'profile lookup goes through this field (ProfileGuard, /me, etc.).',
  })
  @Prop({
    type: Types.ObjectId,
    ref: 'Kine',
    required: true,
    index: true,
  })
  kineId: Types.ObjectId;

  @ApiProperty({
    type: String,
    required: false,
    description: 'Cabinet de rattachement. Null pour STUDENT (pas de cabinet).',
  })
  @Prop({
    type: Types.ObjectId,
    ref: 'Cabinet',
    required: false,
    default: null,
    index: true,
  })
  cabinetId?: Types.ObjectId | null;

  @ApiProperty({ type: String, description: 'Role applique dans ce contexte' })
  @Prop({ type: Types.ObjectId, ref: 'Role', required: true })
  roleId: Types.ObjectId;

  @ApiProperty({ enum: PROFILE_TYPES })
  // Explicit `type: String` — Mongoose can't infer it from a union alias.
  @Prop({ type: String, required: true, enum: PROFILE_TYPES, index: true })
  profileType: ProfileType;

  @ApiProperty({ default: true })
  @Prop({ default: true, index: true })
  isActive: boolean;

  @ApiProperty({
    type: String,
    required: false,
    description:
      "Plan d'abonnement attache au profil. Peut etre herite du cabinet pour MEMBER/ASSISTANT.",
  })
  @Prop({
    type: Types.ObjectId,
    ref: 'Subscription',
    required: false,
    default: null,
    index: true,
  })
  subscriptionPlanId?: Types.ObjectId | null;

  @ApiProperty({
    type: [PermissionOverride],
    default: [],
    description: "Grants/revokes appliques par-dessus les permissions du role.",
  })
  @Prop({ type: [PermissionOverrideSchema], default: [] })
  customPermissionOverrides: PermissionOverride[];

  @ApiProperty({
    type: Object,
    default: {},
    description:
      "Donnees specifiques au profileType (ex: { school, academicYear, justificatifUrl } pour STUDENT, " +
      "{ contractStart, contractEnd, workingDays } pour REMPLACANT, { isReplacement } pour LIBERAL).",
  })
  @Prop({ type: Object, default: {} })
  additionalMetadata: Record<string, unknown>;

  @ApiProperty({
    required: false,
    description:
      "Timestamp d'acceptation des CGU pour CE profil (regle metier: CGU requis a chaque creation de Profil).",
  })
  @Prop()
  cguAcceptedAt?: Date;

  @ApiProperty({ required: false, description: 'Version des CGU acceptees pour ce profil' })
  @Prop()
  cguVersion?: string;

  @ApiProperty({
    type: ProfileFreemium,
    required: false,
    description:
      "Etat freemium du profil. Absent pour MEMBER/ASSISTANT (couverts par l'abonnement du cabinet).",
  })
  @Prop({ type: ProfileFreemiumSchema, required: false })
  freemium?: ProfileFreemium;

  @ApiProperty({
    default: false,
    description:
      'Per-profile cabinet-admin flag. Decoupled from roleId so an admin label ' +
      'can exist independently of permission grants.',
  })
  @Prop({ default: false })
  isCabinetAdmin: boolean;
}

export const KineProfileSchema = SchemaFactory.createForClass(KineProfile);

// Indexes for the queries ProfileGuard / select-profile / admin views run.
KineProfileSchema.index({ kineId: 1, isActive: 1 });
KineProfileSchema.index({ kineId: 1, profileType: 1 });
KineProfileSchema.index({ cabinetId: 1, isActive: 1 });
