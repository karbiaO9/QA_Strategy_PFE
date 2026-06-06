import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'kine@cabinet.fr' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'rt_xyz...' })
  @IsString()
  resetToken: string;

  @ApiProperty({ example: 'NewPassword123!' })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
