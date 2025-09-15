import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ContactForwardDto {
  @ApiProperty({
    description:
      'Phone as received from the Telegram contact share (raw). Server will normalize it to E.164.',
    example: '+380123456789',
  })
  @IsString()
  phone: string;

  @ApiProperty({
    description: 'Telegram chat id (numeric).',
    example: '123456789',
  })
  @IsString()
  chatId: string;
}
