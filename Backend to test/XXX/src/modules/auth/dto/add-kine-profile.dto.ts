import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  Equals,
  IsBoolean,
  IsEnum,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  Max,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { IsLuhn } from '@common/validators/luhn.decorator';


export enum AddKineProfileType {
  LIBERAL = 'LIBERAL',
  ADMIN_GROUP = 'ADMIN_GROUP',
  STUDENT = 'STUDENT',
  MEMBER = 'MEMBER',
  ASSISTANT = 'ASSISTANT',
}


const asBoolean = ({ value }: { value: unknown }): unknown => {
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === '1' || value === 1) return true;
  if (value === 'false' || value === '0' || value === 0) return false;
  return value;
};


export class AddKineProfileDto {
  @ApiProperty({
    enum: AddKineProfileType,
    description:
      "Type de profil a ajouter sur le kine. Voir le summary pour les champs requis par type.",
  })
  @IsEnum(AddKineProfileType)
  profileType: AddKineProfileType;

  @ApiProperty({
    required: false,
    example: true,
    description:
      "Acceptation des CGU lors de l'ajout du profil. " +
      "Par defaut true cote admin. Accepte 'true'/'false' en multipart.",
    default: true,
  })
  @IsOptional()
  @Transform(asBoolean)
  @IsBoolean()
  @Equals(true, { message: 'You must accept the Terms of Service to create a profile.' })
  cguAccepted?: boolean;

  @ApiProperty({
    required: false,
    example: '1.0',
    description: "Version des CGU acceptees pour ce profil (default: '1.0').",
  })
  @IsOptional()
  @IsString()
  cguVersion?: string;

  // Clinical profiles (LIBERAL + ADMIN_GROUP + MEMBER)
  

  @ApiProperty({
    required: false,
    example: '123456789',
    description:
      "[LIBERAL, ADMIN_GROUP, MEMBER] Numero professionnel: ADELI (9 chiffres) ou RPPS (11 chiffres). " +
      "Optionnel si le Compte Kine en porte deja un (sera reutilise). Interdit sur STUDENT / ASSISTANT " +
      "(valide cote service apres lookup du Kine).",
  })
  @IsOptional()
  @IsString()
  @Matches(/^(\d{9}|\d{11})$/, {
    message: 'professionalNumber must be 9 digits (ADELI) or 11 digits (RPPS).',
  })
  professionalNumber?: string;

  // New-cabinet flows (LIBERAL + ADMIN_GROUP)

  @ApiProperty({
    required: false,
    example: 'Cabinet Ali Dupont',
    description: '[LIBERAL, ADMIN_GROUP] Nom du cabinet a creer.',
  })
  @ValidateIf((o: AddKineProfileDto) =>
    o.profileType === AddKineProfileType.LIBERAL ||
    o.profileType === AddKineProfileType.ADMIN_GROUP,
  )
  @IsString()
  @Length(2, 150)
  cabinetName?: string;

  @ApiProperty({
    required: false,
    example: '15 Rue de Rivoli',
    description: '[LIBERAL, ADMIN_GROUP] Rue du cabinet.',
  })
  @ValidateIf((o: AddKineProfileDto) =>
    o.profileType === AddKineProfileType.LIBERAL ||
    o.profileType === AddKineProfileType.ADMIN_GROUP,
  )
  @IsString()
  @MinLength(5)
  street?: string;

  @ApiProperty({
    required: false,
    example: '75001',
    description: '[LIBERAL, ADMIN_GROUP] Code postal.',
  })
  @ValidateIf((o: AddKineProfileDto) =>
    o.profileType === AddKineProfileType.LIBERAL ||
    o.profileType === AddKineProfileType.ADMIN_GROUP,
  )
  @IsString()
  @Length(3, 10)
  postalCode?: string;

  @ApiProperty({
    required: false,
    example: 'Paris',
    description: '[LIBERAL, ADMIN_GROUP: obligatoire] [STUDENT: optionnel] Ville.',
  })
  @ValidateIf((o: AddKineProfileDto) =>
    o.profileType === AddKineProfileType.LIBERAL ||
    o.profileType === AddKineProfileType.ADMIN_GROUP,
  )
  @IsString()
  @Length(2, 100)
  city?: string;

  // ADMIN_GROUP specifics

  @ApiProperty({
    required: false,
    example: '81234567800013',
    description: '[ADMIN_GROUP] SIRET 14 chiffres, valide par Luhn.',
  })
  @ValidateIf((o: AddKineProfileDto) => o.profileType === AddKineProfileType.ADMIN_GROUP)
  @IsString()
  @IsLuhn(14, { message: 'SIRET must be 14 digits and valid per the Luhn algorithm.' })
  siret?: string;

  @ApiProperty({
    required: false,
    example: 'Cabinet Paris Centre SAS',
    description: '[ADMIN_GROUP] Denomination legale (optionnel).',
  })
  @ValidateIf((o: AddKineProfileDto) => o.profileType === AddKineProfileType.ADMIN_GROUP)
  @IsOptional()
  @IsString()
  @Length(2, 200)
  legalName?: string;

  // LIBERAL specifics

  @ApiProperty({
    required: false,
    default: false,
    description:
      "[LIBERAL] Case 'Je suis remplacant'. True -> profileType stocke = REMPLACANT. " +
      "Accepte 'true'/'false' en multipart.",
  })
  @ValidateIf((o: AddKineProfileDto) => o.profileType === AddKineProfileType.LIBERAL)
  @IsOptional()
  @Transform(asBoolean)
  @IsBoolean()
  isReplacement?: boolean;

  // STUDENT specifics

  @ApiProperty({
    required: false,
    example: 'IFMK Paris',
    description: "[STUDENT] Nom de l'ecole.",
  })
  @ValidateIf((o: AddKineProfileDto) => o.profileType === AddKineProfileType.STUDENT)
  @IsString()
  @Length(2, 150)
  school?: string;

  @ApiProperty({
    required: false,
    example: 3,
    minimum: 1,
    maximum: 5,
    description: "[STUDENT] Annee d'etudes (1-5).",
  })
  @ValidateIf((o: AddKineProfileDto) => o.profileType === AddKineProfileType.STUDENT)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  academicYear?: number;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description:
      "[STUDENT] Fichier justificatif etudiant (PDF / JPG / PNG, max 5 Mo). " +
      "Champ multipart, nom `justificatif`. Le serveur stocke le fichier sur le bucket S3 " +
      "configure et persiste l'URL resultante (eventuellement presignee).\n\n" +
      "Au moins une des deux entrees (fichier OU `justificatifUrl`) est obligatoire pour STUDENT.",
  })
  justificatif?: any;

  @ApiProperty({
    required: false,
    example: 'https://cdn.physioconnect.com/justifs/emma-2026.pdf',
    description:
      "[STUDENT] URL du justificatif etudiant. Optionnel SI un fichier `justificatif` est envoye " +
      "dans la meme requete (multipart/form-data) — le serveur stocke alors le fichier et construit " +
      "l'URL publique correspondante.",
  })
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsString()
  @IsUrl({ require_protocol: true })
  justificatifUrl?: string;

  // Subscription — admin scope only; the service layer strips it on self-add.
  // Key invariant: subscriptions are ALWAYS per-profile, never per-user.
  // For MEMBER / ASSISTANT the profile inherits the cabinet's plan (leave
  // this field null). Kine self-add cannot supply this field (stripped at
  // service level).

  @ApiProperty({
    required: false,
    example: '65f2a1b0c1d2e3f4a5b6c7d8',
    description:
      '[ADMIN-ONLY] ObjectId du plan d\'abonnement attache au profil. ' +
      'Ignore cote self-add (le kine n\'achete pas son abonnement depuis cet endpoint). ' +
      'MEMBER / ASSISTANT heritent du plan du cabinet — laisser vide.',
  })
  @IsOptional()
  @IsMongoId({ message: 'subscriptionPlanId must be a valid Mongo ObjectId.' })
  subscriptionPlanId?: string;

  // MEMBER + ASSISTANT — join an existing cabinet.

  @ApiProperty({
    required: false,
    example: '65f2a1b0c1d2e3f4a5b6c7d8',
    description:
      '[MEMBER, ASSISTANT] ObjectId du cabinet existant auquel rattacher le profil. ' +
      'Obligatoire pour MEMBER et ASSISTANT. Le cabinet doit exister.',
  })
  @ValidateIf((o: AddKineProfileDto) =>
    o.profileType === AddKineProfileType.MEMBER ||
    o.profileType === AddKineProfileType.ASSISTANT,
  )
  @IsMongoId({ message: 'cabinetId must be a valid Mongo ObjectId.' })
  cabinetId?: string;
}
