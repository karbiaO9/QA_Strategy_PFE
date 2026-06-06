import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'kine@cabinet.fr' })
  @IsEmail()
  email: string;
}
