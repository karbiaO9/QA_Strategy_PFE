import { ApiProperty } from '@nestjs/swagger';
import {
  Equals,
  IsBoolean,
  IsOptional,
  IsString,
  Length,
  Matches,
  ValidateIf,
} from 'class-validator';
import {
  PASSWORD_MESSAGE,
  PASSWORD_REGEX,
} from '@common/validators/password';
import { Match } from '@common/validators/match.decorator';


export class AcceptInvitationDto {
  @ApiProperty({
    description:
      "JWT signe issu du lien d'invitation. Contient cabinetId, targetProfileType, roleId, invitedByKineId. TTL 7 jours.",
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  invitationToken: string;

  @ApiProperty({ example: 'Ali', minLength: 2, maxLength: 100 })
  @IsString()
  @Length(2, 100)
  firstName: string;

  @ApiProperty({ example: 'Dupont', minLength: 2, maxLength: 100 })
  @IsString()
  @Length(2, 100)
  lastName: string;

  @ApiProperty({
    example: 'Kine123!',
    description: 'Min 8 caracteres, 1 majuscule, 1 chiffre, 1 caractere special.',
  })
  @IsString()
  @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  password: string;

  @ApiProperty({
    example: 'Kine123!',
    description: 'Doit etre strictement identique a `password`.',
  })
  @IsString()
  @Match('password', { message: 'passwordConfirmation must match password.' })
  passwordConfirmation: string;

  @ApiProperty({
    example: true,
    description: "Acceptation des CGU. ",
  })
  @IsBoolean()
  @Equals(true, { message: 'You must accept the Terms of Service to create an account.' })
  cguAccepted: boolean;

  @ApiProperty({ required: false, example: '1.0' })
  @IsOptional()
  @IsString()
  cguVersion?: string;

  @ApiProperty({
    required: false,
    example: '123456789',
    description:
      "Numero professionnel ADELI (9 chiffres) ou RPPS (11 chiffres). " +
      "Obligatoire pour un profil cible `MEMBER` ; absent pour `ASSISTANT` (validation serveur " +
      "apres decodage du token).",
  })
  @ValidateIf((_, value) => value !== undefined && value !== null && value !== '')
  @IsString()
  @Matches(/^(\d{9}|\d{11})$/, {
    message: 'professionalNumber must be 9 digits (ADELI) or 11 digits (RPPS).',
  })
  professionalNumber?: string;
}
