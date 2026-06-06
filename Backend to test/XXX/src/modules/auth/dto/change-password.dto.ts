import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';
import {
  PASSWORD_MESSAGE,
  PASSWORD_REGEX,
} from '@common/validators/password';
import { Match } from '@common/validators/match.decorator';


export class ChangePasswordDto {
  @ApiProperty({
    example: 'OldPassword123!',
    description: "Mot de passe courant. Verifie cote serveur avant mise a jour.",
  })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    example: 'NewPassword123!',
    description:
      'Nouveau mot de passe. Min 8 caracteres, 1 majuscule, 1 chiffre, 1 caractere special.',
  })
  @IsString()
  @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  newPassword: string;

  @ApiProperty({
    example: 'NewPassword123!',
    description: "Confirmation du nouveau mot de passe. Doit etre strictement identique a `newPassword`.",
  })
  @IsString()
  @Match('newPassword', {
    message: 'newPasswordConfirmation must match newPassword.',
  })
  newPasswordConfirmation: string;
}
