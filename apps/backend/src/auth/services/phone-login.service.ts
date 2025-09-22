import { Injectable, Logger } from '@nestjs/common';
import { OtpService } from '../../otp/otp.service';
import { TelegramService } from '../../telegram/telegram.service';
import { TransferService } from '../../telegram/transfer.service';
import { UserService } from '../../users/user.service';
import { normalizePhoneToE164 } from '../../utils/phone.util';
import { SessionService } from './session.service';

@Injectable()
export class PhoneLoginService {
  private readonly logger = new Logger(PhoneLoginService.name);

  constructor(
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
    private readonly otpService: OtpService,
    private readonly transferService: TransferService,
    private readonly telegramService: TelegramService,
  ) {}

  async startLoginByPhone(rawPhone: string, existingSessionId?: string) {
    const phone = normalizePhoneToE164(String(rawPhone ?? ''));
    let user = await this.userService.findByPhone(phone);
    if (!user) {
      user = await this.userService.createByPhone(phone);
      this.logger.log(`Created user for phone=${phone}`);
    }

    let session;
    if (existingSessionId) {
      session = await this.sessionService.getById(existingSessionId);
      if (!session) {
        this.logger.warn(
          `Provided existingSessionId=${existingSessionId} not found, creating a new session for user ${user.id}`,
        );
        session = await this.sessionService.createSessionForUser(user.id);
      }
    } else {
      session = await this.sessionService.createSessionForUser(user.id);
    }

    const chatId = user.telegramChatId ?? null;
    if (chatId) {
      try {
        const otp = await this.otpService.createAndStoreOtp(phone);

        const res: any = await this.telegramService.sendOtpToChat(chatId, otp);
        this.logger.debug(
          `Telegram send result for chatId=${chatId}: ${JSON.stringify(res)}`,
        );

        if (res && res.ok) {
          this.logger.log(
            `Sent OTP to existing chatId=${chatId} for phone=${phone}`,
          );
          if (process.env.NODE_ENV === 'development') {
            return { ok: true, via: 'telegram', sessionId: session.id, otp };
          }
          return { ok: true, via: 'telegram', sessionId: session.id };
        }

        this.logger.warn(
          `Telegram send returned not-ok for chatId=${chatId}, fallback to deep-link`,
          res?.error ?? res,
        );
      } catch (err: any) {
        this.logger.warn(
          `Telegram send to chatId=${chatId} failed, will fallback to deep-link: ${err?.message ?? err}`,
        );
      }

      const transfer = await this.transferService.createTransfer(
        phone,
        session.id,
      );
      const botUsername = process.env.TELEGRAM_BOT_USERNAME ?? null;
      const url = botUsername
        ? `https://t.me/${botUsername}?start=${transfer.token}`
        : undefined;
      return { ok: true, via: 'link', sessionId: session.id, url };
    }

    const transfer = await this.transferService.createTransfer(
      phone,
      session.id,
    );
    const botUsername = process.env.TELEGRAM_BOT_USERNAME ?? null;
    const url = botUsername
      ? `https://t.me/${botUsername}?start=${transfer.token}`
      : undefined;

    return { ok: true, via: 'link', sessionId: session.id, url };
  }
}
