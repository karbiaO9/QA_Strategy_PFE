import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsOptional,
  IsString,
  IsUrl,
  Length,
} from 'class-validator';


export class UpdatePatientSelfDto {
  @ApiProperty({ required: false, example: 'Marie', minLength: 2, maxLength: 100 })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  firstName?: string;

  @ApiProperty({ required: false, example: 'Durand', minLength: 2, maxLength: 100 })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  lastName?: string;

  @ApiProperty({
    required: false,
    example: '+33698765432',
    description: 'Numero de telephone (format E.164 recommande).',
  })
  @IsOptional()
  @IsString()
  @Length(5, 30)
  phone?: string;

  @ApiProperty({
    required: false,
    example: '1990-05-15T00:00:00.000Z',
    description: 'Date de naissance ISO 8601.',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateOfBirth?: Date;

  @ApiProperty({
    required: false,
    example: 'https://cdn.physioconnect.com/avatars/marie.jpg',
  })
  @IsOptional()
  @IsString()
  @IsUrl({ require_protocol: true })
  profilePhoto?: string;

  @ApiProperty({ required: false, example: 'Europe/Paris' })
  @IsOptional()
  @IsString()
  @Length(2, 60)
  timezone?: string;

  @ApiProperty({ required: false, example: 'fr' })
  @IsOptional()
  @IsString()
  @Length(2, 8)
  language?: string;
}
