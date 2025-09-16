import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SessionService } from 'src/auth';
import { TransferService } from 'src/telegram';
import { OtpService } from '../otp';

@Injectable()
export class MaintenanceService {
  private readonly logger = new Logger(MaintenanceService.name);
  constructor(
    private readonly otpService: OtpService,
    private readonly transferService: TransferService,
    private readonly sessionService: SessionService,
  ) {}

  @Cron('*/5 * * * *')
  async handleCleanup() {
    try {
      this.logger.log('Maintenance cron: starting cleanup');
      await this.otpService.cleanupExpired();
      await this.transferService.cleanupExpired();
      await this.sessionService.cleanupExpired();
      this.logger.log('Maintenance cron: cleanup finished');
    } catch (err) {
      this.logger.error('Maintenance cron error', err);
    }
  }
}
