import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, Length } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({
    description:
      'Session id returned by login-by-phone. Used to tie verification to a specific login attempt.',
    example: 'a9f3b6d2-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  })
  @IsUUID()
  sessionId: string;

  @ApiProperty({
    description: 'One-time password (OTP) received by the user in Telegram.',
    example: '123456',
  })
  @IsString()
  @Length(4, 6)
  otp: string;
}
