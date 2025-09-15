import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({ example: '+79111234567', description: 'Phone number' })
  @IsPhoneNumber()
  phone: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'user@example.com', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ example: 'StrongPass123!', required: false })
  @IsOptional()
  @IsString()
  password?: string;
}
