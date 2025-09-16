import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from 'prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health/health.controller';
import { MaintenanceService } from './maintenance/maintenance.service';
import { OtpModule } from './otp/otp.module';
import { TelegramModule } from './telegram/telegram.module';
import { UserModule } from './users/user.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    OtpModule,
    TelegramModule,
    AuthModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController, HealthController],
  providers: [AppService, MaintenanceService],
})
export class AppModule {}
