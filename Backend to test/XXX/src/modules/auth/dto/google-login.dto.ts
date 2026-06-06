import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class GoogleLoginDto {
  @ApiProperty({
    description:
      "JWT id_token Google obtenu côté frontend (Google Identity Services / Sign In with Google " +
      'mobile SDK). Le backend vérifie la signature, l\'audience et l\'issuer avant de connecter ' +
      "le patient. Le client_secret n\'est JAMAIS envoyé dans cette requête.",
    example: 'eyJhbGciOiJSUzI1NiIs...',
  })
  @IsString()
  @MinLength(10)
  idToken: string;
}
