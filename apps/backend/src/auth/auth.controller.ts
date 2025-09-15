// apps/backend/src/auth/auth.controller.ts
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Logger,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import * as bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';

import { OtpService } from '../otp/otp.service';
import { TelegramService } from '../telegram/telegram.service';
import { TransferService } from '../telegram/transfer.service';
import { UserService } from '../users/user.service';
import { normalizePhoneToE164 } from '../utils/phone.util';
import { AuthService } from './auth.service';
import { LoginByPhoneDto } from './dto/login-by-phone.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { SessionService } from './session.service';

type UserSafeView = { name?: string | null; email?: string | null };

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly otpService: OtpService,
    private readonly telegramService: TelegramService,
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
    private readonly transferService: TransferService,
  ) {}

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

  // @Post('request-otp')
  // async requestOtp(@Body() body: { phone: string }) {
  //   const raw = String(body?.phone ?? '');
  //   let phone: string;
  //   try {
  //     phone = normalizePhoneToE164(raw);
  //   } catch (err) {
  //     throw new BadRequestException('Invalid phone number');
  //   }

  //   if (await this.otpService.hasActiveOtp(phone)) {
  //     this.logger.log(`OTP already active for ${phone}`);
  //     return { ok: true };
  //   }

  //   const otp = await this.otpService.createAndStoreOtp(phone);

  //   const chatId = await this.userService.getTelegramChatIdByPhone(phone);

  //   if (chatId) {
  //     const res = await this.telegramService.sendOtpToChat(chatId, otp);
  //     if (!res.ok) {
  //       this.logger.warn(
  //         `Telegram send failed for chatId=${chatId}`,
  //         res.error,
  //       );
  //     }
  //     if (process.env.NODE_ENV === 'development')
  //       return { ok: true, via: 'telegram', otp };
  //     return { ok: true, via: 'telegram' };
  //   }

  //   const botUsername = process.env.TELEGRAM_BOT_USERNAME ?? null;
  //   const botLink = botUsername ? `https://t.me/${botUsername}` : undefined;

  //   this.logger.log(
  //     `No chatId for phone=${phone}. Instructing user to open bot.`,
  //   );
  //   if (process.env.NODE_ENV === 'development') {
  //     return { ok: true, needs_bot: true, botLink, otp };
  //   }
  //   return { ok: true, needs_bot: true, botLink };
  // }

  @Post('register')
  async register(@Body() dto: RegisterUserDto): Promise<UserSafeView> {
    const createdUser = await this.authService.register(dto);
    return { name: createdUser.name ?? null, email: createdUser.email ?? null };
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login user and get JWT access token + set refresh cookie',
  })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({
    status: 200,
    description: 'JWT access token and user',
    schema: {
      example: {
        accessToken: 'eyJ...',
        user: { name: 'Anton', email: 'test@dev.com' },
      },
    },
  })
  async login(
    @Body() dto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string; user: UserSafeView }> {
    const result = (await this.authService.login(dto)) as {
      accessToken: string;
      refreshToken: string;
      user: UserSafeView;
    };
    res.cookie('refreshToken', result.refreshToken, this.getCookieOptions());

    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string; user: UserSafeView }> {
    const token = req.cookies?.refreshToken as string | undefined;
    if (!token) {
      throw new UnauthorizedException('No refresh token');
    }

    const result = (await this.authService.refreshTokens(token)) as {
      accessToken: string;
      refreshToken: string;
      user: UserSafeView;
    };

    res.cookie('refreshToken', result.refreshToken, this.getCookieOptions());

    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.refreshToken as string | undefined;
    if (token) {
      await this.authService.logoutByRefreshToken(token).catch(() => {});
    }

    res.clearCookie('refreshToken', this.getCookieOptions());
    return { ok: true };
  }

  @Post('login-by-phone')
  @ApiOperation({
    summary: 'Start login-by-phone flow',
    description:
      'Create or find user by phone, create a pending session and transfer token. Returns sessionId and a Telegram deep link URL that opens the bot with the token.',
  })
  @ApiBody({ type: LoginByPhoneDto })
  @ApiResponse({
    status: 200,
    description: 'Session created and deep-link returned',
  })
  async loginByPhone(@Body() body: LoginByPhoneDto) {
    const raw = String(body?.phone ?? '');
    let phone: string;
    try {
      phone = normalizePhoneToE164(raw);
    } catch (err) {
      throw new BadRequestException('Invalid phone number');
    }
    let user = await this.userService.findByPhone(phone);
    if (!user) {
      user = await this.userService.createByPhone(phone);
    }

    const session = await this.sessionService.createSessionForUser(user.id);
    const chatId = user.telegramChatId;
    if (chatId) {
      try {
        const otp = await this.otpService.createAndStoreOtp(phone);
        const sendRes = await this.telegramService.sendOtpToChat(chatId, otp);

        if (sendRes && sendRes.ok) {
          if (process.env.NODE_ENV === 'development') {
            return { ok: true, via: 'telegram', sessionId: session.id, otp };
          }
          return { ok: true, via: 'telegram', sessionId: session.id };
        } else {
          this.logger?.warn?.(
            `Telegram send failed for chatId=${chatId}, falling back to deeplink: ${JSON.stringify(
              sendRes?.error ?? sendRes,
            )}`,
          );
        }
      } catch (err) {
        this.logger?.warn?.(
          `Error sending OTP to existing chatId=${chatId}, falling back to deeplink: ${err?.message ?? err}`,
        );
      }
    }
    const transfer = await this.transferService.createTransfer(
      phone,
      session.id,
    );
    const botUsername = process.env.TELEGRAM_BOT_USERNAME;
    const url = botUsername
      ? `https://t.me/${botUsername}?start=${transfer.token}`
      : undefined;
    if (process.env.NODE_ENV === 'development') {
      return { ok: true, sessionId: session.id, url, token: transfer.token };
    }
    return { ok: true, sessionId: session.id, url };
  }

  @Post('verify-otp')
  async verifyOtp(
    @Body() dto: VerifyOtpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { sessionId, otp } = dto;

    if (!sessionId) {
      throw new BadRequestException('Missing sessionId');
    }

    const session = await this.sessionService.getById(sessionId);
    if (!session) {
      throw new BadRequestException('Invalid session');
    }
    if (await this.sessionService.isExpired(session)) {
      throw new BadRequestException('Session expired');
    }

    const user = await this.userService.findById(session.userId);
    if (!user || !user.phone) {
      throw new BadRequestException('User or phone missing');
    }

    const ok = await this.otpService.verifyOtp(user.phone, otp);
    if (!ok) {
      throw new UnauthorizedException('Invalid OTP');
    }

    await this.sessionService.markAuthenticated(sessionId);

    // Ensure JWT secrets exist
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      this.logger.error('JWT_SECRET is not set in environment');
      throw new Error('JWT_SECRET is not configured on the server');
    }
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET ?? jwtSecret;

    const accessToken = jwt.sign({ sub: user.id }, jwtSecret, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    });
    const refreshToken = jwt.sign({ sub: user.id }, jwtRefreshSecret, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
    });

    const hashed = await bcrypt.hash(refreshToken, 10);
    await this.userService.setCurrentRefreshToken(user.id, hashed);

    if (typeof (this as any).getCookieOptions === 'function') {
      res.cookie(
        'refreshToken',
        refreshToken,
        (this as any).getCookieOptions(),
      );
    } else {
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }

    return {
      ok: true,
      accessToken,
      refreshToken,
      user: { id: user.id, phone: user.phone },
    };
  }
}
