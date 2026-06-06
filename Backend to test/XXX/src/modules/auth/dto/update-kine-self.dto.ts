import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, Length } from 'class-validator';


export class UpdateKineSelfDto {
  @ApiProperty({ required: false, example: 'Ali', minLength: 2, maxLength: 100 })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  firstName?: string;

  @ApiProperty({ required: false, example: 'Dupont', minLength: 2, maxLength: 100 })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  lastName?: string;

  @ApiProperty({
    required: false,
    example: '+33612345678',
    description: 'Format libre E.164. Non bloquant, affiche dans le Switcher.',
  })
  @IsOptional()
  @IsString()
  @Length(5, 30)
  phone?: string;

  @ApiProperty({
    required: false,
    example: 'https://cdn.physioconnect.com/avatars/ali.jpg',
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
