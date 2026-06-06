import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  Equals,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import {
  PASSWORD_MESSAGE,
  PASSWORD_REGEX,
} from '@common/validators/password';
import { Match } from '@common/validators/match.decorator';

const asBoolean = ({ value }: { value: unknown }): unknown => {
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === '1' || value === 1) return true;
  if (value === 'false' || value === '0' || value === 0) return false;
  return value;
};

/**
 * Shared base for all kine registration DTOs (autonomous screen & invitation screen).
 *
 * Covers the "champs communs" section of the V2 specification:
 *  - firstName / lastName (2-100 chars)
 *  - email (RFC 5322)
 *  - password + confirmation (min 8, 1 upper, 1 digit, 1 special)
 *  - CGU acceptance (boolean, must be true; versioning optional)
 */
export abstract class RegisterKineBaseDto {
  @ApiProperty({
    example: 'Ali',
    description: 'Prenom du professionnel. 2 a 100 caracteres.',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @Length(2, 100)
  firstName: string;

  @ApiProperty({
    example: 'Dupont',
    description: 'Nom de famille. 2 a 100 caracteres.',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @Length(2, 100)
  lastName: string;

  @ApiProperty({
    example: 'ali.dupont@cabinet-paris.fr',
    description:
      "Adresse email valide (RFC 5322). Sert d'identifiant unique du Compte. Un meme email ne peut etre reutilise pour creer un second Compte ; un utilisateur existant est invite a ajouter un Profil plutot que de re-creer un Compte.",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Kine123!',
    description:
      'Mot de passe. Minimum 8 caracteres, au moins 1 majuscule, 1 chiffre et 1 caractere special.',
  })
  @IsString()
  @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  password: string;

  @ApiProperty({
    example: 'Kine123!',
    description: "Confirmation du mot de passe. Doit etre strictement identique au champ 'password'.",
  })
  @IsString()
  @Match('password', { message: 'passwordConfirmation must match password.' })
  passwordConfirmation: string;

  @ApiProperty({
    example: true,
    description:
      "Acceptation des Conditions Generales d'Utilisation. Doit etre 'true'. L'acceptation est requise a CHAQUE creation de Profil. Accepte 'true'/'false' en multipart.",
  })
  @Transform(asBoolean)
  @IsBoolean()
  @Equals(true, { message: 'You must accept the Terms of Service to create an account.' })
  cguAccepted: boolean;

  @ApiProperty({
    required: false,
    example: '1.0',
    description: "Version des CGU acceptees (default: '1.0'). Utilisee pour audit.",
  })
  @IsOptional()
  @IsString()
  cguVersion?: string;
}
