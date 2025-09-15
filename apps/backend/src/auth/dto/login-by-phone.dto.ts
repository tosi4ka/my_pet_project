import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginByPhoneDto {
  @ApiProperty({
    description:
      'Phone number used for login or registration (will be normalized).',
    example: '+380503072421',
  })
  @IsString()
  phone: string;
}
