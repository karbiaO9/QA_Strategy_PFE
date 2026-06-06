import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
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
 * Back-office DTO used by SUPER_ADMIN to create additional platform admins.
 * Admins are NOT multi-profile: a single L1 doc with a direct roleId.
 */
export class CreateAdminDto {
  @ApiProperty({ example: 'Thomas', minLength: 2, maxLength: 100 })
  @IsString()
  @Length(2, 100)
  firstName: string;

  @ApiProperty({ example: 'Platform', minLength: 2, maxLength: 100 })
  @IsString()
  @Length(2, 100)
  lastName: string;

  @ApiProperty({ example: 'admin@physioconnect.com' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Admin123!',
    description:
      'Mot de passe. Min 8 caracteres, 1 majuscule, 1 chiffre, 1 caractere special.',
  })
  @IsString()
  @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  password: string;

  @ApiProperty({ required: false, description: 'URL photo de profil.' })
  @IsOptional()
  @IsString()
  profilePhoto?: string;

  @ApiProperty({
    example: '6612a3f5e4b0c1a2d3f4e5a6',
    description: 'ObjectId du Role a assigner. Doit etre un role systeme (ex: SUPER_ADMIN).',
  })
  @IsMongoId()
  roleId: string;

  @ApiProperty({
    enum: ['ACTIVE', 'INACTIVE'],
    required: false,
    default: 'ACTIVE',
    description: "INACTIVE = compte suspendu, login bloque.",
  })
  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE'])
  status?: 'ACTIVE' | 'INACTIVE';
}
