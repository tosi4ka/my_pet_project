import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { UserModule } from 'src/users/user.module';
import { OtpModule } from '../otp/otp.module';
import { TelegramController } from './telegram.controller';
import { TelegramService } from './telegram.service';
import { TransferService } from './transfer.service';

@Module({
  imports: [UserModule, PrismaModule, OtpModule],
  controllers: [TelegramController],
  providers: [TelegramService, TransferService],
  exports: [TelegramService, TransferService],
})
export class TelegramModule {}
