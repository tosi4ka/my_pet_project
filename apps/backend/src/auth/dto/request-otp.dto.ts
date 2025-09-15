import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RequestOtpDto {
  @ApiProperty({
    description:
      'User phone number in any readable format. Will be normalized to E.164 on the server.',
    example: '+380123456789',
  })
  @IsString()
  phone: string;
}
