import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, Length } from 'class-validator';


export class UpdateAdminSelfDto {
  @ApiProperty({ required: false, example: 'Thomas', minLength: 2, maxLength: 100 })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  firstName?: string;

  @ApiProperty({ required: false, example: 'Platform', minLength: 2, maxLength: 100 })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  lastName?: string;

  @ApiProperty({
    required: false,
    example: 'https://cdn.physioconnect.com/avatars/thomas.jpg',
    description: 'URL pre-uploadee (module file-storage Sprint 2).',
  })
  @IsOptional()
  @IsString()
  @IsUrl({ require_protocol: true })
  profilePhoto?: string;
}
