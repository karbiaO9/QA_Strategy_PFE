import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum } from 'class-validator';

export enum InvitationTargetProfileType {
  MEMBER = 'MEMBER',
  ASSISTANT = 'ASSISTANT',
}


export class CreateInvitationDto {
  @ApiProperty({
    example: 'nouveau.membre@cabinet-paris.fr',
    description:
      "Email du futur membre ou assistant. Pre-rempli dans le formulaire d'acceptation mais modifiable " +
      "par l'invite cote UI. Si l'email correspond deja a un Compte existant, le front doit router vers " +
      "un parcours 'login + rattachement' plutot qu'une inscription complete.",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    enum: InvitationTargetProfileType,
    example: InvitationTargetProfileType.MEMBER,
    description:
      "Type de profil que l'invite creera :\n" +
      "- `MEMBER` : kine praticien rejoignant le cabinet. Devra fournir un ADELI/RPPS lors de l'acceptation.\n" +
      "- `ASSISTANT` : secretaire/assistant administratif. Pas de numero professionnel, acces non-clinique.",
  })
  @IsEnum(InvitationTargetProfileType)
  targetProfileType: InvitationTargetProfileType;
}
