import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';

import { OtpService } from '../../otp/otp.service';
import { TelegramService } from '../../telegram/telegram.service';
import { UserService } from '../../users/user.service';
import { normalizePhoneToE164 } from '../../utils/phone.util';
import { LoginByPhoneDto } from '../dto/login-by-phone.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { RegisterUserDto } from '../dto/register-user.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { AuthService } from '../services/auth.service';
import { PhoneLoginService } from '../services/phone-login.service';
import { SessionService } from '../services/session.service';

type UserSafeView = {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly sessionService: SessionService,
    private readonly userService: UserService,
    private readonly otpService: OtpService,
    private readonly telegramService: TelegramService,
    private readonly authService: AuthService,
    private readonly phoneLoginService: PhoneLoginService, // <- injected
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
      maxAge: Number(process.env.SESSION_TTL_SECONDS ?? 60 * 60) * 1000,
      domain: undefined as string | undefined,
    };
  }

  @Post('register')
  @ApiOperation({ summary: 'Register new user (email/phone optional)' })
  async register(
    @Body() dto: RegisterUserDto,
  ): Promise<{ ok: true; user: UserSafeView }> {
    const created = await this.authService.register(dto);
    return {
      ok: true,
      user: {
        id: created.id,
        name: created.name ?? null,
        email: created.email ?? null,
        phone: created.phone ?? null,
      },
    };
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login user by email/password — returns session cookie',
  })
  async login(
    @Body() dto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ ok: boolean; sessionId?: string; user?: UserSafeView }> {
    const user = await this.userService.findByEmail(dto.email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const bcrypt = await import('bcryptjs');
    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const session = await this.sessionService.createSessionForUser(user.id);
    await this.sessionService.markAuthenticated(session.id);

    res.cookie('sessionId', session.id, this.getCookieOptions());

    return {
      ok: true,
      sessionId: session.id,
      user: {
        id: user.id,
        name: user.name ?? null,
        email: user.email ?? null,
        phone: user.phone ?? null,
      },
    };
  }

  @Post('login-by-phone')
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

    try {
      if (
        this.phoneLoginService &&
        typeof this.phoneLoginService.startLoginByPhone === 'function'
      ) {
        return await this.phoneLoginService.startLoginByPhone(
          phone,
          session.id,
        );
      }
    } catch (err) {
      this.logger.warn(
        'phoneLoginService.startLoginByPhone error, falling back to basic response',
        err,
      );
    }

    const botUsername = process.env.TELEGRAM_BOT_USERNAME;
    const url = botUsername
      ? `https://t.me/${botUsername}?start=${session.id}`
      : undefined;

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
    if (this.sessionService.isExpired(session)) {
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

    // Mark session authenticated
    await this.sessionService.markAuthenticated(sessionId);

    // Return sessionId as part of response so client can request cookie set
    // We don't set cookie here because verify-otp is called from server-side NextAuth authorize
    // and Set-Cookie would not be forwarded to browser automatically.
    return {
      ok: true,
      sessionId,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name ?? null,
        email: user.email ?? null,
      },
    };
  }

  /**
   * Endpoint to set httpOnly cookie sessionId in the browser.
   * Client should call this AFTER successful NextAuth signIn (or directly after verify-otp)
   * with JSON { sessionId } and credentials: 'include'.
   */
  @Post('set-session')
  async setSession(
    @Body() body: { sessionId?: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const sid = String(body?.sessionId ?? '');
    if (!sid) {
      throw new BadRequestException('Missing sessionId');
    }
    const session = await this.sessionService.getById(sid);
    if (!session) throw new BadRequestException('Invalid sessionId');

    // Ensure session is AUTHENTICATED before setting cookie
    if (session.status !== 'AUTHENTICATED') {
      throw new BadRequestException('Session not authenticated');
    }

    // Set httpOnly cookie
    res.cookie('sessionId', sid, this.getCookieOptions());
    return { ok: true, sessionId: sid };
  }

  @Get('me')
  async me(@Req() req: Request) {
    // Prefer X-Session-Id header, then cookie
    const headerSid =
      (req.headers &&
        (req.headers['x-session-id'] || req.headers['x-sessionid'])) ??
      undefined;
    const sessionIdFromHeader = headerSid ? String(headerSid) : undefined;
    const sessionId =
      sessionIdFromHeader ?? (req.cookies?.sessionId as string | undefined);

    if (!sessionId) {
      return { ok: false, user: null };
    }

    const session = await this.sessionService.getById(sessionId);
    if (!session) return { ok: false, user: null };
    if (this.sessionService.isExpired(session))
      return { ok: false, user: null };
    if (session.status !== 'AUTHENTICATED') return { ok: false, user: null };

    const user = await this.userService.findById(session.userId);
    if (!user) return { ok: false, user: null };

    return {
      ok: true,
      user: {
        id: user.id,
        phone: user.phone ?? null,
        name: user.name ?? null,
        email: user.email ?? null,
      },
    };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const sessionId = req.cookies?.sessionId as string | undefined;
    if (sessionId) {
      try {
        await this.sessionService.expireById(sessionId);
      } catch (err) {
        this.logger.warn('Failed to expire session on logout', err);
      }
    }
    res.clearCookie('sessionId', this.getCookieOptions());
    return { ok: true };
  }
}
