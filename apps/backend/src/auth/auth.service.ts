import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../users/user.service';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async register(dto: RegisterUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    return this.userService.create({
      ...dto,
      password: hashedPassword,
    });
  }
}
