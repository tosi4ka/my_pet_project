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
import type { Request, Response } from 'express';

import { OtpService } from '../../otp/otp.service';
import { TelegramService } from '../../telegram/telegram.service';
import { UserService } from '../../users/user.service';
import { LoginByPhoneDto } from '../dto/login-by-phone.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { RegisterUserDto } from '../dto/register-user.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { AuthService } from '../services/auth.service';
import { PhoneLoginService } from '../services/phone-login.service';
import { SessionService } from '../services/session.service';
import { TokenService } from '../services/token.service';

type UserSafeView = { name?: string | null; email?: string | null };

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly phoneLoginService: PhoneLoginService,
    private readonly tokenService: TokenService,
    private readonly otpService: OtpService,
    private readonly telegramService: TelegramService,
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
  ) {}

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
    this.tokenService.setRefreshCookie(res, result.refreshToken);
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

    this.tokenService.setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.refreshToken as string | undefined;
    if (token) {
      await this.authService.logoutByRefreshToken(token).catch(() => {});
    }
    this.tokenService.clearRefreshCookie(res);
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
    const result = await this.phoneLoginService.startLoginByPhone(body.phone);
    return result;
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

    const { accessToken, refreshToken } = this.tokenService.createTokens(
      user.id,
    );
    await this.tokenService.persistRefreshTokenForUser(user.id, refreshToken);
    this.tokenService.setRefreshCookie(res, refreshToken);

    return {
      ok: true,
      accessToken,
      refreshToken,
      user: { id: user.id, phone: user.phone },
    };
  }
}
