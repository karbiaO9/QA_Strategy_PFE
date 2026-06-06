import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
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
import { RegisterKineBaseDto } from './register-kine-base.dto';
import { IsLuhn } from '@common/validators/luhn.decorator';

const asBoolean = ({ value }: { value: unknown }): unknown => {
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === '1' || value === 1) return true;
  if (value === 'false' || value === '0' || value === 0) return false;
  return value;
};


export enum KineRegisterProfileType {
  LIBERAL = 'LIBERAL',
  ADMIN_GROUP = 'ADMIN_GROUP',
  STUDENT = 'STUDENT',
}

/**
 * Unified registration DTO for the .
 *
 * The frontend sends a single POST to /api/v1/kine/auth/register with a
 * discriminator field `profileType`. The server validates only the fields
 * relevant to that type (via `@ValidateIf`) and dispatches to the appropriate
 * service method.
 *
 * | profileType  | Required extras                                                       | Forbidden      |
 * | ------------ | --------------------------------------------------------------------- | -------------- |
 * | LIBERAL      | professionalNumber, cabinetName, street, postalCode, city             | siret, school* |
 * |              | + optional: phone, isReplacement                                      |                |
 * | ADMIN_GROUP  | professionalNumber, cabinetName, street, postalCode, city, siret      | school*        |
 * |              | + optional: legalName                                                 |                |
 * | STUDENT      | school, academicYear (1-5), justificatifUrl                           | professionalNumber, cabinet fields, siret |
 * |              | + optional: city                                                      |                |
 *
 * *Forbidden fields, when sent with the wrong profileType, are silently
 *  stripped by the global ValidationPipe (whitelist: true).
 */
export class RegisterKineDto extends RegisterKineBaseDto {
  @ApiProperty({
    enum: KineRegisterProfileType,
    description:
      "Selecteur de profil. Determine quels champs specifiques sont valides et " +
      "quel flow backend est execute.",
  })
  @IsEnum(KineRegisterProfileType)
  profileType: KineRegisterProfileType;

  // Clinical profiles (LIBERAL + ADMIN_GROUP)

  @ApiProperty({
    required: false,
    example: '123456789',
    description:
      '[LIBERAL, ADMIN_GROUP] Numero professionnel: ADELI (9 chiffres) ou RPPS (11 chiffres). ' +
      "Verification manuelle en arriere-plan (non bloquante). Interdit pour STUDENT.",
  })
  @ValidateIf((o: RegisterKineDto) => o.profileType !== KineRegisterProfileType.STUDENT)
  @IsString()
  @Matches(/^(\d{9}|\d{11})$/, {
    message: 'professionalNumber must be 9 digits (ADELI) or 11 digits (RPPS).',
  })
  professionalNumber?: string;

  @ApiProperty({
    required: false,
    example: 'Cabinet Ali Dupont',
    description: '[LIBERAL, ADMIN_GROUP] Nom du cabinet cree. 2 a 150 caracteres.',
  })
  @ValidateIf((o: RegisterKineDto) => o.profileType !== KineRegisterProfileType.STUDENT)
  @IsString()
  @Length(2, 150)
  cabinetName?: string;

  @ApiProperty({
    required: false,
    example: '15 Rue de Rivoli',
    description: '[LIBERAL, ADMIN_GROUP] Rue du cabinet. Minimum 5 caracteres.',
  })
  @ValidateIf((o: RegisterKineDto) => o.profileType !== KineRegisterProfileType.STUDENT)
  @IsString()
  @MinLength(5)
  street?: string;

  @ApiProperty({
    required: false,
    example: '75001',
    description:
      '[LIBERAL, ADMIN_GROUP] Code postal. Max 10 caracteres, format variable par pays ' +
      '(France/Espagne = 5 chiffres, Belgique = 4 chiffres, UK = 5-8 alphanumeriques).',
  })
  @ValidateIf((o: RegisterKineDto) => o.profileType !== KineRegisterProfileType.STUDENT)
  @IsString()
  @Length(3, 10)
  postalCode?: string;

  // ADMIN_GROUP only

  @ApiProperty({
    required: false,
    example: '81234567800013',
    description:
      '[ADMIN_GROUP] SIRET France: 14 chiffres, valide par algorithme de Luhn. ' +
      "A abstraire par pays lors de l'expansion UE (CIF, Steuernummer, Partita IVA, etc.).",
  })
  @ValidateIf((o: RegisterKineDto) => o.profileType === KineRegisterProfileType.ADMIN_GROUP)
  @IsString()
  @IsLuhn(14, { message: 'SIRET must be 14 digits and valid per the Luhn algorithm.' })
  siret?: string;

  @ApiProperty({
    required: false,
    example: 'Cabinet Paris Centre SAS',
    description: '[ADMIN_GROUP] Denomination legale du cabinet (optionnel).',
  })
  @ValidateIf((o: RegisterKineDto) => o.profileType === KineRegisterProfileType.ADMIN_GROUP)
  @IsOptional()
  @IsString()
  @Length(2, 200)
  legalName?: string;

  // LIBERAL only

  @ApiProperty({
    required: false,
    example: '+33612345678',
    description: '[LIBERAL] Telephone (optionnel). Format libre, non bloquant.',
  })
  @ValidateIf((o: RegisterKineDto) => o.profileType === KineRegisterProfileType.LIBERAL)
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    required: false,
    default: false,
    description:
      '[LIBERAL] Case "Je suis remplacant". True -> profileType stocke = REMPLACANT ; ' +
      'False (defaut) -> profileType stocke = LIBERAL.',
  })
  @ValidateIf((o: RegisterKineDto) => o.profileType === KineRegisterProfileType.LIBERAL)
  @IsOptional()
  @Transform(asBoolean)
  @IsBoolean()
  isReplacement?: boolean;

  // STUDENT only

  @ApiProperty({
    required: false,
    example: 'IFMK Paris',
    description: "[STUDENT] Nom de l'ecole / IFMK. Texte libre, 2 a 150 caracteres. Pas de liste fermee en V1.",
  })
  @ValidateIf((o: RegisterKineDto) => o.profileType === KineRegisterProfileType.STUDENT)
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
  @ValidateIf((o: RegisterKineDto) => o.profileType === KineRegisterProfileType.STUDENT)
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
    example: 'https://cdn.physioconnect.com/justifs/emma-laurent-2026.pdf',
    description:
      "[STUDENT] URL du justificatif etudiant (carte etudiante, certificat de scolarite). " +
      "Optionnel SI un fichier `justificatif` est envoye dans la meme requete (multipart/form-data) — " +
      "le serveur stocke alors le fichier et construit l'URL publique correspondante. " +
      "Au moins une des deux entrees (fichier OU URL) est obligatoire pour un profil STUDENT.",
  })
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsString()
  @IsUrl({ require_protocol: true })
  justificatifUrl?: string;

  // Universally optional

  @ApiProperty({
    required: false,
    example: 'Paris',
    description:
      '[LIBERAL, ADMIN_GROUP: obligatoire] [STUDENT: optionnel] Ville. 2 a 100 caracteres.',
  })
  @ValidateIf(
    (o: RegisterKineDto) => o.profileType !== KineRegisterProfileType.STUDENT,
  )
  @IsString()
  @Length(2, 100)
  city?: string;
}
