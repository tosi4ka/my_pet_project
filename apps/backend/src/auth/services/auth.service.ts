import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

import { UserService } from '../../users/user.service';
import { LoginUserDto } from '../dto/login-user.dto';
import { RegisterUserDto } from '../dto/register-user.dto';
import { TokenService } from './token.service';

export type UserSafeView = { name?: string | null; email?: string | null };
export type AuthResult = {
  accessToken: string;
  refreshToken: string;
  user: UserSafeView;
};

const BCRYPT_SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
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

    const created = await this.userService.create(data);
    return created;
  }

  async loginByUser(user: User): Promise<AuthResult> {
    const { accessToken, refreshToken } = this.tokenService.createTokens(
      user.id,
    );
    await this.tokenService.persistRefreshTokenForUser(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: this.buildUserView(user),
    };
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

    const { accessToken, refreshToken } = this.tokenService.createTokens(
      user.id,
    );
    await this.tokenService.persistRefreshTokenForUser(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: this.buildUserView(user),
    };
  }
  async refreshTokens(refreshToken: string): Promise<AuthResult> {
    const verified = this.tokenService.verifyRefreshToken(refreshToken);
    if (!verified || typeof verified.sub !== 'string') {
      throw new BadRequestException('Invalid token payload');
    }
    const userId = verified.sub;

    const user = await this.userService.getById(userId);
    if (!user || typeof user.refreshToken !== 'string') {
      throw new UnauthorizedException('No refresh stored');
    }

    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isValid) throw new UnauthorizedException('Invalid refresh token');

    const { accessToken, refreshToken: newRefresh } =
      this.tokenService.createTokens(user.id);
    await this.tokenService.persistRefreshTokenForUser(user.id, newRefresh);

    return {
      accessToken,
      refreshToken: newRefresh,
      user: this.buildUserView(user),
    };
  }

  async logoutByRefreshToken(refreshToken: string): Promise<void> {
    const verified = this.tokenService.verifyRefreshToken(refreshToken);
    if (!verified || typeof verified.sub !== 'string') return;
    const userId = verified.sub;
    await this.userService.setCurrentRefreshToken(userId, null);
  }

  private buildUserView(user: User): UserSafeView {
    return { name: user.name ?? null, email: user.email ?? null };
  }
}
