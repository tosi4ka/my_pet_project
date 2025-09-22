import { ApiProperty } from '@nestjs/swagger';

export class LoginByPhoneResponseDto {
  @ApiProperty({ description: 'Operation result', example: true })
  ok: boolean;

  @ApiProperty({
    description:
      'Session id generated for this login attempt. Server may also set sessionId cookie.',
    example: 'a9f3b6d2-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    required: false,
  })
  sessionId?: string;

  @ApiProperty({
    description:
      'Deep link URL to the Telegram bot (open if user needs to start bot).',
    example: 'https://t.me/My_learn_otp_bot?start=token123',
    required: false,
  })
  url?: string;

  @ApiProperty({
    description: 'If true — client should ask user to open bot',
    required: false,
  })
  needs_bot?: boolean;

  @ApiProperty({
    description: 'Dev-only: returned OTP for testing',
    required: false,
  })
  otp?: string;

  @ApiProperty({
    description: 'How OTP delivered (e.g. "telegram")',
    required: false,
  })
  via?: string;
}

export class VerifyOtpResponseDto {
  @ApiProperty({ description: 'Operation result', example: true })
  ok: boolean;

  @ApiProperty({
    description:
      'Authenticated user object. Server also sets sessionId cookie.',
    required: false,
    example: { id: '16ea1a1e-...', phone: '+33759622837' },
  })
  user?: {
    id: string;
    phone?: string | null;
    name?: string | null;
    email?: string | null;
  };
}
