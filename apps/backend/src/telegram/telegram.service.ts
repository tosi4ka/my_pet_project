import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private token = process.env.TELEGRAM_BOT_TOKEN;
  private base = `https://api.telegram.org/bot${this.token}`;

  async sendOtpToChat(
    chatId: string | number,
    otp: string,
  ): Promise<{ ok: true } | { ok: false; error: any }> {
    const text = `Your verification code: ${otp} (valid ${process.env.OTP_TTL_SECONDS ?? 300}s)`;
    try {
      const res = await axios.post(`${this.base}/sendMessage`, {
        chat_id: chatId,
        text,
      });
      this.logger.log(`Sent OTP message to chatId=${chatId}`);
      return { ok: true };
    } catch (err: any) {
      const payload = err?.response?.data ?? {
        message: err?.message ?? String(err),
      };
      this.logger.error('Telegram send failed', payload);
      return { ok: false, error: payload };
    }
  }

  async requestContactFromChat(chatId: string | number, text: string) {
    try {
      const payload = {
        chat_id: chatId,
        text,
        reply_markup: {
          keyboard: [
            [
              {
                text: 'Share contact',
                request_contact: true,
              },
            ],
          ],
          one_time_keyboard: true,
          resize_keyboard: true,
        },
      };
      const res = await axios.post(`${this.base}/sendMessage`, payload);
      this.logger.log(`Requested contact from chatId=${chatId}`);
      return res.data;
    } catch (err: any) {
      const payload = err?.response?.data ?? {
        message: err?.message ?? String(err),
      };
      this.logger.error('Telegram requestContact failed', payload);
      throw err;
    }
  }
}
