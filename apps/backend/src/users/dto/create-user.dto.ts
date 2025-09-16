import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string | null;

  @ApiProperty({
    example: 'John Doe',
    description: 'User name',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string | null;

  @ApiProperty({
    example: 'password123',
    description: 'User password (min 6 chars)',
    minLength: 6,
    required: false,
  })
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string | null;
}
