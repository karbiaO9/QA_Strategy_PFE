import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import {
  PASSWORD_MESSAGE,
  PASSWORD_REGEX,
} from '@common/validators/password';


export class CreateKineDto {
  @ApiProperty({
    example: 'ali.dupont@cabinet-paris.fr',
    description: 'Email unique du Compte.',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Kine123!',
    description:
      'Mot de passe. Min 8 caracteres, 1 majuscule, 1 chiffre, 1 caractere special.',
  })
  @IsString()
  @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  password: string;

  @ApiProperty({ example: 'Ali', minLength: 2, maxLength: 100 })
  @IsString()
  @Length(2, 100)
  firstName: string;

  @ApiProperty({ example: 'Dupont', minLength: 2, maxLength: 100 })
  @IsString()
  @Length(2, 100)
  lastName: string;

  @ApiProperty({ required: false, example: 'Europe/Paris' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ required: false, example: 'fr' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({ required: false, example: '+33612345678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false, description: 'URL photo de profil' })
  @IsOptional()
  @IsString()
  profilePhoto?: string;

  @ApiProperty({
    required: false,
    enum: ['INVITED', 'ACTIVE', 'INACTIVE'],
    description:
      "Statut platforme. 'INVITED' = compte pre-cree, en attente de confirmation; 'ACTIVE' = actif; 'INACTIVE' = desactive/suspendu.",
  })
  @IsOptional()
  @IsEnum(['INVITED', 'ACTIVE', 'INACTIVE'])
  status?: 'INVITED' | 'ACTIVE' | 'INACTIVE';

  @ApiProperty({
    required: false,
    example: '123456789',
    description:
      'Numero professionnel: ADELI (9 chiffres) ou RPPS (11 chiffres). Unique parmi les Comptes ACTIFS. STUDENT et ASSISTANT n\'en ont pas.',
  })
  @IsOptional()
  @IsString()
  @Matches(/^(\d{9}|\d{11})$/, {
    message: 'professionalNumber must be 9 digits (ADELI) or 11 digits (RPPS).',
  })
  professionalNumber?: string;

  @ApiProperty({
    required: false,
    enum: ['PENDING', 'VERIFIED', 'REJECTED'],
    description:
      "US-I.1. Positionne automatiquement a 'PENDING' par les flux d'inscription lorsqu'un professionalNumber est fourni. Mis a jour par l'admin via PATCH /api/admin/v1/kines/:id/verification.",
  })
  @IsOptional()
  @IsEnum(['PENDING', 'VERIFIED', 'REJECTED'])
  verificationStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED';

  @ApiProperty({ required: false, description: 'Timestamp acceptation CGU.' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  cguAcceptedAt?: Date;

  @ApiProperty({ required: false, example: '1.0' })
  @IsOptional()
  @IsString()
  cguVersion?: string;
}
