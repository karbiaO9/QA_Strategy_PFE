import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { TwoFactorMethod } from '@common/enums/two-factor-method.enum';

export type KineDocument = HydratedDocument<Kine>;
export type KineProfileDocument = HydratedDocument<KineProfile>;

export type ProfileType =
  | 'LIBERAL'
  | 'REMPLACANT'
  | 'ADMIN_GROUP'
  | 'MEMBER'
  | 'STUDENT'
  | 'ASSISTANT';

export const PROFILE_TYPES: ProfileType[] = [
  'LIBERAL',
  'REMPLACANT',
  'ADMIN_GROUP',
  'MEMBER',
  'STUDENT',
  'ASSISTANT',
];

@Schema({ _id: false })
export class PermissionOverride {
  @Prop({ type: Types.ObjectId, ref: 'Permission', required: true })
  permissionId: Types.ObjectId;

  @Prop({ required: true })
  granted: boolean;
}
export const PermissionOverrideSchema = SchemaFactory.createForClass(PermissionOverride);

@Schema({ _id: false })
export class ProfileFreemium {
  @Prop()
  startedAt?: Date;

  @Prop()
  endsAt?: Date;

  @Prop({ default: false })
  consumed: boolean;
}
export const ProfileFreemiumSchema = SchemaFactory.createForClass(ProfileFreemium);

@Schema({ _id: true })
export class KineProfile {
  _id: Types.ObjectId;

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
  @Prop({ required: true, enum: PROFILE_TYPES, index: true })
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
    description: "Grants/revokes applique's par-dessus les permissions du role.",
  })
  @Prop({ type: [PermissionOverrideSchema], default: [] })
  customPermissionOverrides: PermissionOverride[];

  @ApiProperty({
    type: Object,
    default: {},
    description:
      "Donnees specifiques au profileType (ex: { school, academicYear, justificatifUrl } pour STUDENT, { contractStart, contractEnd, workingDays } pour REMPLACANT, { isReplacement } pour LIBERAL).",
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
      "Per-profile cabinet-admin flag. A kine with multiple profiles can be cabinet admin in one cabinet (profile A) and not in another (profile B). Decoupled from roleId so an admin label can exist independently of permission grants.",
  })
  @Prop({ default: false })
  isCabinetAdmin: boolean;
}

export const KineProfileSchema = SchemaFactory.createForClass(KineProfile);

@Schema({ timestamps: true, collection: 'kines' })
export class Kine {
  @ApiProperty({ example: 'ali.dupont@cabinet-paris.fr' })
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

  @ApiProperty({ example: 'Ali' })
  @Prop({ required: true })
  firstName: string;

  @ApiProperty({ example: 'Dupont' })
  @Prop({ required: true })
  lastName: string;

  @ApiProperty({
    type: String,
    required: false,
    description:
      'ObjectId du Cabinet. Peut etre null : un kine peut exister sans cabinet (orphelin) et changer de cabinet.',
  })
  @Prop({
    type: Types.ObjectId,
    ref: 'Cabinet',
    required: false,
    default: null,
    index: true,
  })
  cabinetId?: Types.ObjectId | null;

  @ApiProperty({ required: false, description: 'National Registry Number' })
  @Prop()
  rppsNumber?: string;

  @ApiProperty({ required: false, description: 'Regional License Number' })
  @Prop()
  licenseNumber?: string;

  @ApiProperty({
    required: false,
    description:
      "Numero professionnel (ADELI 9 chiffres ou RPPS 11 chiffres). Unique sur la plateforme parmi " +
      "les kines ACTIFS uniquement (index partiel defini en bas du schema — US-I.2). " +
      "Une desactivation libere le numero pour un nouveau Compte.",
  })
  @Prop()
  professionalNumber?: string;

  @ApiProperty({
    required: false,
    enum: ['PENDING', 'VERIFIED', 'REJECTED'],
    description:
      "Statut de verification manuelle du numero professionnel. " +
      "Positionne a 'PENDING' des qu'un Compte est cree avec un professionalNumber. " +
      "Mis a jour par un SUPER_ADMIN via PATCH /api/admin/v1/kines/:id/verification. " +
      "Non-bloquant : un kine PENDING conserve un acces complet a l'application ",
  })
  @Prop({
    enum: ['PENDING', 'VERIFIED', 'REJECTED'],
    required: false,
    index: true,
  })
  verificationStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED';

  @ApiProperty({ required: false, description: 'Timestamp de la derniere decision admin.' })
  @Prop()
  verifiedAt?: Date;

  @ApiProperty({
    type: String,
    required: false,
    description: "ObjectId de l'admin qui a pris la derniere decision.",
  })
  @Prop({ type: Types.ObjectId, ref: 'Admin' })
  verifiedByAdminId?: Types.ObjectId;

  @ApiProperty({
    required: false,
    description:
      "Motif saisi par l'admin lorsque la decision est REJECTED. Garde le dernier motif pour " +
      "audit (re-soumission possible en remettant verificationStatus=PENDING).",
  })
  @Prop()
  verificationRejectionReason?: string;

  @ApiProperty({ example: 'Europe/Paris', default: 'Europe/Paris' })
  @Prop({ default: 'Europe/Paris' })
  timezone: string;

  @ApiProperty({ example: 'fr', default: 'fr' })
  @Prop({ default: 'fr' })
  language: string;

  @ApiProperty({ enum: ['INVITED', 'ACTIVE', 'INACTIVE'], default: 'ACTIVE' })
  @Prop({
    required: true,
    enum: ['INVITED', 'ACTIVE', 'INACTIVE'],
    default: 'ACTIVE',
    index: true,
  })
  status: 'INVITED' | 'ACTIVE' | 'INACTIVE';

  @Prop({ select: false })
  invitationToken?: string;

  @Prop()
  invitedAt?: Date;

  @ApiProperty({ default: false })
  @Prop({ default: false })
  twoFactorEnabled: boolean;

  @ApiProperty({ enum: TwoFactorMethod, required: false })
  @Prop({ type: String, enum: Object.values(TwoFactorMethod) })
  twoFactorMethod?: TwoFactorMethod;

  @Prop()
  twoFactorPhone?: string;

  @ApiProperty({ required: false })
  @Prop()
  lastLoginAt?: Date;

  @ApiProperty({
    type: String,
    required: false,
    description:
      "ObjectId du dernier profil (profiles[]._id) selectionne via /select-profile. " +
      "Le frontend l'utilise pour pre-selectionner ce profil a la prochaine connexion.",
  })
  @Prop({ type: Types.ObjectId, required: false, default: null })
  lastProfileId?: Types.ObjectId | null;

  @ApiProperty({ required: false, description: 'URL photo de profil (CDN)' })
  @Prop()
  profilePhoto?: string;

  @ApiProperty({ required: false })
  @Prop()
  phone?: string;

  @ApiProperty({ required: false, description: 'Timestamp acceptation des CGU' })
  @Prop()
  cguAcceptedAt?: Date;

  @ApiProperty({ required: false, description: 'Version des CGU acceptees' })
  @Prop()
  cguVersion?: string;

  // Profiles live in the `kineprofiles` collection. No @Prop here — the
  // field is declared so TS lets `kine.profiles` work, and KinesService
  // populates it at read time. Direct Mongo: db.kineprofiles.find({ kineId }).
  profiles?: KineProfile[];
}

export const KineSchema = SchemaFactory.createForClass(Kine);

KineSchema.index(
  { professionalNumber: 1 },
  {
    unique: true,
    name: 'ux_kines_professionalNumber_active',
    partialFilterExpression: {
      status: 'ACTIVE',
      professionalNumber: { $type: 'string' },
    },
  },
);
