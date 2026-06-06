import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';


export class AttachInvitationDto {
  @ApiProperty({
    description: "JWT signe issu du lien d'invitation.",
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  invitationToken: string;

  @ApiProperty({
    description:
      "Mot de passe courant du Compte kine existant. Compare via bcrypt cote serveur.",
    example: 'MyCurrentPassword123!',
  })
  @IsString()
  password: string;

  @ApiProperty({
    required: false,
    example: '123456789',
    description:
      "Numero professionnel ADELI (9 chiffres) ou RPPS (11 chiffres). " +
      "Obligatoire si le token porte targetProfileType=MEMBER ; interdit pour ASSISTANT.",
  })
  @IsOptional()
  @IsString()
  @Matches(/^(\d{9}|\d{11})$/, {
    message: 'professionalNumber must be 9 digits (ADELI) or 11 digits (RPPS).',
  })
  professionalNumber?: string;
}
