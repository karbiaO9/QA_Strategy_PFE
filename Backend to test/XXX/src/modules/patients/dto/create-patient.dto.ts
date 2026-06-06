import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsMongoId,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import {
  PASSWORD_MESSAGE,
  PASSWORD_REGEX,
} from '@common/validators/password';

/**
 * Back-office DTO used by a kine or admin to create a Patient record.
 *
 * For self-registration, use /api/v1/patient/auth/register (RegisterPatientDto).
 */
export class CreatePatientDto {
  @ApiProperty({ example: 'marie.durand@patient.fr' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Patient123!',
    description:
      'Mot de passe. Min 8 caracteres, 1 majuscule, 1 chiffre, 1 caractere special.',
  })
  @IsString()
  @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  password: string;

  @ApiProperty({ example: 'Marie', minLength: 2, maxLength: 100 })
  @IsString()
  @Length(2, 100)
  firstName: string;

  @ApiProperty({ example: 'Durand', minLength: 2, maxLength: 100 })
  @IsString()
  @Length(2, 100)
  lastName: string;

  @ApiProperty({
    example: '66f1a2b3c4d5e6f7g8h9i0j1',
    description: 'ObjectId du Role (doit etre le role PATIENT).',
  })
  @IsMongoId()
  roleId: string;

  @ApiProperty({
    required: false,
    example: '66f1a2b3c4d5e6f7g8h9i0j2',
    description: 'ObjectId du Cabinet de rattachement.',
  })
  @IsOptional()
  @IsMongoId()
  cabinetId?: string;

  @ApiProperty({ required: false, example: 'Europe/Paris' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ required: false, example: 'fr' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({
    required: false,
    example: 'ABC123DEF456',
    description: 'Code unique de liaison (12 caracteres A-Z / 0-9). Genere automatiquement si omis.',
  })
  @IsOptional()
  @IsString()
  @Length(12, 12)
  @Matches(/^[A-Z0-9]{12}$/)
  uniqueCode?: string;

  @ApiProperty({ required: false, example: '+33611111111' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false, description: 'URL photo de profil.' })
  @IsOptional()
  @IsString()
  profilePhoto?: string;
}
