import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class SelectProfileDto {
  @ApiProperty({
    example: '65f2a1b0c1d2e3f4a5b6c7d8',
    description:
      "ObjectId du profil embedded (profiles[]._id) que le kine choisit apres login. " +
      "Le serveur stampe ce profil comme 'lastProfileId' sur le Compte et retourne " +
      "les permissions CASL resolues pour ce profil.",
  })
  @IsMongoId({ message: 'profileId must be a valid Mongo ObjectId.' })
  profileId: string;
}
