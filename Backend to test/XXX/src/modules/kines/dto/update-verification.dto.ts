import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  Length,
  ValidateIf,
} from 'class-validator';
import { VerificationDecision } from '@common/enums/verification-decision.enum';

export class UpdateVerificationDto {
  @ApiProperty({
    enum: VerificationDecision,
    description:
      "Decision de l'admin : `APPROVE` positionne verificationStatus=VERIFIED, " +
      "`REJECT` positionne REJECTED (motif obligatoire), `RESET` remet PENDING.",
  })
  @IsEnum(VerificationDecision)
  decision: VerificationDecision;

  @ApiProperty({
    required: false,
    example: "Document illisible, merci de re-soumettre une photo nette.",
    description:
      "Motif du rejet. Obligatoire si `decision === REJECT` (>= 3 caracteres).",
  })
  @ValidateIf((o: UpdateVerificationDto) => o.decision === VerificationDecision.REJECT)
  @IsString()
  @Length(3, 500)
  rejectionReason?: string;

  @ApiProperty({
    required: false,
    description:
      "Optionnel: meme commentaire interne lors d'un APPROVE ou RESET (audit). " +
      "Non utilise pour le moment, reserve pour un futur champ auditLog.",
  })
  @IsOptional()
  @IsString()
  @Length(3, 500)
  note?: string;
}


export class ListVerificationsQueryDto {
  @ApiProperty({
    required: false,
    enum: ['PENDING', 'VERIFIED', 'REJECTED'],
    default: 'PENDING',
    description:
      "Filtre par statut. Par defaut la file de travail 'PENDING'.",
  })
  @IsOptional()
  @IsEnum(['PENDING', 'VERIFIED', 'REJECTED'])
  status?: 'PENDING' | 'VERIFIED' | 'REJECTED';

  @ApiProperty({ required: false, example: 50, default: 50 })
  @IsOptional()
  limit?: string;

  @ApiProperty({ required: false, example: 0, default: 0 })
  @IsOptional()
  skip?: string;
}
