import { ApiProperty } from '@nestjs/swagger';

export class RawUpdateDto {
  @ApiProperty({
    description:
      'Full Telegram update object forwarded by the bridge (fallback).',
    type: 'object',
    additionalProperties: true,
  })
  update: any;
}
