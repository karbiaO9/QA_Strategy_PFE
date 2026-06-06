import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Max,
  Min,
} from 'class-validator';


export class UpdateKineProfileSelfDto {

  @ApiProperty({
    required: false,
    example: false,
    description:
      'Self-suspension toggle. The kine MAY set `isActive: false` on their ' +
      'own profile (auto-suspend). Reactivation (`isActive: true`) is reserved ' +
      'to SUPER_ADMIN — the service rejects with `403 PROFILE_ACTIVATION_ADMIN_ONLY` ' +
      'when a kine sends `isActive: true` on this self-endpoint.',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    required: false,
    example: 'IFMK Lyon',
    description: "[STUDENT] Mise a jour de l'etablissement d'etude.",
  })
  @IsOptional()
  @IsString()
  @Length(2, 150)
  school?: string;

  @ApiProperty({ required: false, example: 4, minimum: 1, maximum: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  academicYear?: number;

  @ApiProperty({
    required: false,
    example: 'https://cdn.physioconnect.com/justifs/emma-2026-v2.pdf',
    description:
      '[STUDENT] URL du justificatif mis a jour. Le justificatif replace passe le ' +
      'profil en verification PENDING (futur, cf. US-I.1).',
  })
  @IsOptional()
  @IsString()
  @IsUrl({ require_protocol: true })
  justificatifUrl?: string;



}
