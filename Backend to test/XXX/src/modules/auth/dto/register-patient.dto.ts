import { ApiProperty } from '@nestjs/swagger';
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

/**
 * Patient self-registration DTO.
 *
 * The patient receives a uniqueCode generated server-side that serves
 * as the link key presented to their kine (spec V2 does not detail this flow
 * for patients; code retained from V1 for compatibility).
 */
export class RegisterPatientDto {
  @ApiProperty({
    example: 'marie.durand@patient.fr',
    description: 'Adresse email valide (RFC 5322). Unique par Compte.',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Patient123!',
    description:
      'Mot de passe. Minimum 8 caracteres, 1 majuscule, 1 chiffre, 1 caractere special.',
  })
  @IsString()
  @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  password: string;

  @ApiProperty({
    example: 'Patient123!',
    description: "Confirmation du mot de passe. Doit etre strictement identique.",
  })
  @IsString()
  @Match('password', { message: 'passwordConfirmation must match password.' })
  passwordConfirmation: string;

  @ApiProperty({
    example: 'Marie',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @Length(2, 100)
  firstName: string;

  @ApiProperty({
    example: 'Durand',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @Length(2, 100)
  lastName: string;

  @ApiProperty({
    required: false,
    example: '+33611111111',
    description: 'Telephone optionnel. Un patient peut ensuite se logger via email OU telephone.',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    example: true,
    description: "Acceptation des CGU. Obligatoire.",
  })
  @IsBoolean()
  @Equals(true, { message: 'You must accept the Terms of Service to create an account.' })
  cguAccepted: boolean;

  @ApiProperty({ required: false, example: '1.0' })
  @IsOptional()
  @IsString()
  cguVersion?: string;
}
