import { ApiProperty } from '@nestjs/swagger';

export class LoginByPhoneResponseDto {
  @ApiProperty({ description: 'Operation result', example: true })
  ok: boolean;

  @ApiProperty({
    description:
      'Session id generated for this login attempt. Use when calling verify-otp.',
    example: 'a9f3b6d2-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    required: false,
  })
  sessionId?: string;

  @ApiProperty({
    description:
      'Deep link URL to the Telegram bot. Client should redirect user to this URL.',
    example: 'https://t.me/My_learn_otp_bot?start=token123',
    required: false,
  })
  url?: string;
}

export class VerifyOtpResponseDto {
  @ApiProperty({ description: 'Operation result', example: true })
  ok: boolean;

  @ApiProperty({
    description: 'JWT access token (returned after successful verification).',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false,
  })
  accessToken?: string;

  @ApiProperty({
    description: 'JWT refresh token (store securely).',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false,
  })
  refreshToken?: string;
}

export class RequestOtpResponseDto {
  @ApiProperty({ description: 'Operation result', example: true })
  ok: boolean;

  @ApiProperty({
    description:
      'In development mode the server may optionally return the otp for testing. DO NOT return in production.',
    example: '123456',
    required: false,
  })
  otp?: string;

  @ApiProperty({
    description: 'Indicates how the OTP was delivered (e.g. "telegram").',
    example: 'telegram',
    required: false,
  })
  via?: string;
}
