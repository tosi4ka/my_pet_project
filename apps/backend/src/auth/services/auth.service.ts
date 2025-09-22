import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

import { UserService } from '../../users/user.service';
import { LoginUserDto } from '../dto/login-user.dto';
import { RegisterUserDto } from '../dto/register-user.dto';
import { SessionService } from './session.service';

export type UserSafeView = {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
};

export type AuthResult = {
  ok: boolean;
  user: UserSafeView;
  sessionId: string;
};

const BCRYPT_SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
  ) {}

  async register(dto: RegisterUserDto): Promise<User> {
    if (dto.email) {
      const existing = await this.userService.findByEmail(dto.email);
      if (existing) throw new ConflictException('User exists');
    }

    const data: Partial<User> & { phone: string } = {
      phone: dto.phone,
      name: dto.name ?? null,
      email: dto.email ?? null,
      password: null,
    };

    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);
    }

    return this.userService.create(data);
  }

  async login(dto: LoginUserDto): Promise<AuthResult> {
    const user = await this.userService.findByEmail(dto.email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const session = await this.sessionService.createSessionForUser(user.id);
    await this.sessionService.markAuthenticated(session.id);

    return {
      ok: true,
      sessionId: session.id,
      user: this.buildUserView(user),
    };
  }

  async logout(userId: string): Promise<void> {
    await this.sessionService.expireByUserId(userId);
  }

  private buildUserView(user: User): UserSafeView {
    return {
      id: user.id,
      name: user.name ?? null,
      email: user.email ?? null,
      phone: user.phone ?? null,
    };
  }
}
