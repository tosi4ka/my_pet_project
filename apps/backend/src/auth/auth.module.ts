import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'prisma/prisma.module';
import { UserModule } from 'src/users/user.module';
import { OtpModule } from '../otp/otp.module';
import { TelegramModule } from '../telegram/telegram.module';
import { AuthController } from './controllers/auth.controller';
import { SessionAuthGuard } from './guards/session-auth.guard';
import { NormalizePhonePipe } from './pipes/normalize-phone.pipe';
import { AuthService } from './services/auth.service';
import { PhoneLoginService } from './services/phone-login.service';
import { SessionService } from './services/session.service';

@Module({
  imports: [
    UserModule,
    PrismaModule,
    TelegramModule,
    OtpModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-key',
      signOptions: { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    SessionService,
    PhoneLoginService,
    NormalizePhonePipe,
    SessionAuthGuard,
  ],
  exports: [AuthService, SessionService, PhoneLoginService, SessionAuthGuard],
})
export class AuthModule {}
