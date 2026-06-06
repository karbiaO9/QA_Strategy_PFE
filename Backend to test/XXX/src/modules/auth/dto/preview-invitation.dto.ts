import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PreviewInvitationDto {
  @ApiProperty({
    description: "JWT signe issu du lien d'invitation.",
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  invitationToken: string;
}
