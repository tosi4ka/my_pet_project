import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';

type UserSafeView = { name?: string | null; email: string };
type AuthResult = {
  accessToken: string;
  refreshToken: string;
  user: UserSafeView;
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
      path: '/auth',
      maxAge:
        Number(process.env.JWT_REFRESH_EXPIRES_SECONDS ?? 7 * 24 * 60 * 60) *
        1000,
    };
  }

  @Post('register')
  async register(@Body() dto: RegisterUserDto): Promise<UserSafeView> {
    const createdUser = await this.authService.register(dto);
    return { name: createdUser.name ?? null, email: createdUser.email };
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
    const result = (await this.authService.login(dto)) as AuthResult;
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

    const result = (await this.authService.refreshTokens(token)) as AuthResult;

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
}
