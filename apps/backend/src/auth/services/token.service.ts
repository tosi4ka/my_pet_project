import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import type { Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserService } from '../../users/user.service';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(private readonly userService: UserService) {}

  private getCookieOptions() {
    const isProd = process.env.NODE_ENV === 'production';
    const frontendOrigin = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    const backendOrigin =
      process.env.BACKEND_URL ?? `http://localhost:${process.env.PORT ?? 3001}`;
    const crossSite = frontendOrigin !== backendOrigin;

    return {
      httpOnly: true,
      secure: isProd && crossSite,
      sameSite: isProd && crossSite ? ('none' as const) : ('lax' as const),
      path: '/',
      maxAge:
        Number(process.env.JWT_REFRESH_EXPIRES_SECONDS ?? 7 * 24 * 60 * 60) *
        1000,
      domain: undefined as string | undefined,
    };
  }

  createTokens(userId: string) {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      this.logger.error('JWT_SECRET is not set in environment');
      throw new Error('JWT_SECRET is not configured on the server');
    }
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET ?? jwtSecret;

    const accessToken = jwt.sign({ sub: userId }, jwtSecret, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    });
    const refreshToken = jwt.sign({ sub: userId }, jwtRefreshSecret, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
    });

    return { accessToken, refreshToken };
  }

  async persistRefreshTokenForUser(userId: string, refreshToken: string) {
    const hashed = await bcrypt.hash(refreshToken, 10);
    await this.userService.setCurrentRefreshToken(userId, hashed);
  }

  setRefreshCookie(res: Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, this.getCookieOptions());
  }

  clearRefreshCookie(res: Response) {
    res.clearCookie('refreshToken', this.getCookieOptions());
  }

  verifyRefreshToken(token: string): { sub?: string } | null {
    const secret = process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT secret not set');
    try {
      const payload = jwt.verify(token, secret) as { sub?: string };
      return payload;
    } catch {
      return null;
    }
  }
}
