import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../users/user.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';

export type UserSafeView = { name?: string | null; email?: string | null };
export type AuthResult = {
  accessToken: string;
  refreshToken: string;
  user: UserSafeView;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterUserDto): Promise<User> {
    if (dto.email) {
      const existingUser = await this.userService.findByEmail(dto.email);
      if (existingUser) throw new ConflictException('User exists');
    }

    let data: any = {
      phone: dto.phone,
      name: dto.name ?? null,
      email: dto.email ?? null,
    };

    if (dto.password) {
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      data.password = hashedPassword;
    } else {
      data.password = null;
    }

    const created = await this.userService.create(data);
    return created;
  }

  async loginByUser(user: User): Promise<AuthResult> {
    const { accessToken, refreshToken } = await this.getTokensForUser(user);
    const refreshHash = await bcrypt.hash(refreshToken, 10);
    await this.userService.setCurrentRefreshToken(user.id, refreshHash);

    const userView: UserSafeView = {
      name: user.name ?? null,
      email: user.email ?? null,
    };

    return { accessToken, refreshToken, user: userView };
  }

  private async createAccessToken(user: User): Promise<string> {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET ?? process.env.JWT_SECRET,
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    });
  }

  private async createRefreshToken(user: User): Promise<string> {
    const payload = { sub: user.id };
    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
    });
  }

  private async getTokensForUser(user: User) {
    const accessToken = await this.createAccessToken(user);
    const refreshToken = await this.createRefreshToken(user);
    return { accessToken, refreshToken };
  }

  async login(dto: LoginUserDto): Promise<AuthResult> {
    const user = await this.userService.findByEmail(dto.email);
    if (!user || !user.password)
      throw new UnauthorizedException('Invalid credentials');

    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    const { accessToken, refreshToken } = await this.getTokensForUser(user);

    const refreshHash = await bcrypt.hash(refreshToken, 10);
    await this.userService.setCurrentRefreshToken(user.id, refreshHash);

    const userView: UserSafeView = {
      name: user.name ?? null,
      email: user.email,
    };

    return { accessToken, refreshToken, user: userView };
  }

  async refreshTokens(refreshToken: string): Promise<AuthResult> {
    try {
      const verified = (await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET,
      })) as unknown;

      if (typeof verified !== 'object' || verified === null) {
        throw new BadRequestException('Invalid token payload');
      }
      const maybeSub = (verified as Record<string, unknown>)['sub'];
      if (typeof maybeSub !== 'string') {
        throw new BadRequestException('Invalid token payload');
      }
      const userId = maybeSub;

      const user = await this.userService.getById(userId);
      if (!user || typeof user.refreshToken !== 'string') {
        throw new UnauthorizedException('No refresh stored');
      }

      const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isValid) throw new UnauthorizedException('Invalid refresh token');

      const { accessToken, refreshToken: newRefresh } =
        await this.getTokensForUser(user);
      const newHash = await bcrypt.hash(newRefresh, 10);
      await this.userService.setCurrentRefreshToken(user.id, newHash);

      const userView: UserSafeView = {
        name: user.name ?? null,
        email: user.email,
      };
      return { accessToken, refreshToken: newRefresh, user: userView };
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logoutByRefreshToken(refreshToken: string): Promise<void> {
    try {
      const verified = (await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET,
      })) as unknown;

      if (typeof verified !== 'object' || verified === null) return;
      const maybeSub = (verified as Record<string, unknown>)['sub'];
      if (typeof maybeSub !== 'string') return;
      const userId = maybeSub;

      await this.userService.setCurrentRefreshToken(userId, null);
      return;
    } catch {
      return;
    }
  }
}
