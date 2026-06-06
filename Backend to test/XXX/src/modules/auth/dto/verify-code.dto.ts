import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, Matches } from 'class-validator';

export class VerifyCodeDto {
  @ApiProperty({ example: 'kine@cabinet.fr' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456', description: 'Code 6 chiffres' })
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: 'Code must be 6 digits.' })
  code: string;
}
