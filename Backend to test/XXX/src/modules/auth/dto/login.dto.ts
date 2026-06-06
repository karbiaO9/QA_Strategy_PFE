import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'ali.dupont@cabinet-paris.fr',
    description:
      "Identifiant de connexion. Kine et patient : email OU telephone (au format stocke en base, ex: '+33601010102'). " +
      'Admin : email uniquement (la collection admins ne porte pas de champ phone). ' +
      "Le nom de la propriete reste `email` pour preserver la compatibilite client; cote backend, la valeur " +
      "est resolvee via $or {email, phone}.",
  })
  @IsString()
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(6)
  password: string;
}
