import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class TokenForwardDto {
  @ApiProperty({
    description:
      'Transfer / deep-link token extracted from the bot start payload.',
    example: 'a1b2c3d4e5f67890...',
  })
  @IsString()
  token: string;

  @ApiProperty({
    description:
      'Telegram chat id (numeric) where the bot received the start payload.',
    example: '123456789',
  })
  @IsString()
  chatId: string;
}
