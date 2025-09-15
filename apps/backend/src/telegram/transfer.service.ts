import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { OtpService } from '../otp/otp.service';
import { TelegramService } from './telegram.service';

@Injectable()
export class TransferService {
  private readonly logger = new Logger(TransferService.name);
  private readonly TTL_SECONDS = Number(
    process.env.TRANSFER_TTL_SECONDS ?? 300,
  );

  constructor(
    private readonly prisma: PrismaService,
    private readonly otpService: OtpService,
    private readonly telegramService: TelegramService,
  ) {}

  async createTransfer(phone: string, sessionId?: string) {
    const now = new Date();

    const existing = await this.prisma.client.transfer.findFirst({
      where: {
        phone,
        sessionId: sessionId ?? null,
        consumed: false,
        expiresAt: { gt: now },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (existing) {
      this.logger.log(
        `Reusing existing transfer token=${existing.token} phone=${phone} session=${sessionId}`,
      );
      return existing;
    }

    const token = crypto.randomBytes(18).toString('hex');
    const expiresAt = new Date(Date.now() + this.TTL_SECONDS * 1000);
    const record = await this.prisma.client.transfer.create({
      data: { token, phone, sessionId: sessionId ?? null, expiresAt },
    });
    this.logger.log(
      `Created transfer token=${token} phone=${phone} session=${sessionId}`,
    );
    return record;
  }

  async consumeTransfer(token: string, chatId: string) {
    const now = new Date();
    const record = await this.prisma.client.transfer.findFirst({
      where: { token, consumed: false, expiresAt: { gt: now } },
      include: { session: true },
    });
    if (!record) {
      throw new Error('Invalid or expired transfer token');
    }

    const existingUserForChat = await this.prisma.client.user.findFirst({
      where: { telegramChatId: String(chatId) },
    });

    if (existingUserForChat && existingUserForChat.phone === record.phone) {
      try {
        const otp = await this.otpService.createAndStoreOtp(record.phone);
        const res: any = await this.telegramService.sendOtpToChat(chatId, otp);
        if (!res || res.ok === false) {
          this.logger.warn(
            `Telegram send failed for chatId=${chatId}, transfer=${record.id}`,
            res?.error ?? res,
          );
          return {
            ok: false,
            error: res?.error ?? 'send_failed',
            sessionId: record.sessionId ?? null,
          };
        }

        await this.prisma.client.transfer.update({
          where: { id: record.id },
          data: { consumed: true },
        });

        this.logger.log(
          `Consumed transfer token=${token} and sent OTP to chatId=${chatId}`,
        );
        return { ok: true, error: null, sessionId: record.sessionId ?? null };
      } catch (err) {
        this.logger.error('Error while sending OTP to Telegram', err);
        return {
          ok: false,
          error: err?.message ?? err,
          sessionId: record.sessionId ?? null,
        };
      }
    }

    try {
      await this.telegramService.requestContactFromChat(
        chatId,
        `To complete login for ${record.phone}, please press the "Share contact" button so I can verify it's your number.`,
      );
      this.logger.log(
        `Requested contact from chatId=${chatId} for phone=${record.phone}`,
      );
      return {
        ok: false,
        needs_contact: true,
        sessionId: record.sessionId ?? null,
      };
    } catch (err) {
      this.logger.error('Failed to request contact from chat', err);
      return {
        ok: false,
        error: err?.message ?? err,
        sessionId: record.sessionId ?? null,
      };
    }
  }

  async consumeTransferByPhone(phone: string, chatId: string) {
    const now = new Date();
    const record = await this.prisma.client.transfer.findFirst({
      where: { phone, consumed: false, expiresAt: { gt: now } },
      orderBy: { createdAt: 'desc' },
    });
    if (!record) {
      this.logger.log(`No pending transfer for phone=${phone}`);
      return { ok: false, reason: 'no_transfer' };
    }
    try {
      await this.prisma.client.user.upsert({
        where: { phone },
        create: { phone, telegramChatId: String(chatId) },
        update: { telegramChatId: String(chatId) },
      });
    } catch (err) {
      try {
        const user = await this.prisma.client.user.findFirst({
          where: { phone },
        });
        if (user) {
          await this.prisma.client.user.update({
            where: { id: user.id },
            data: { telegramChatId: String(chatId) },
          });
        } else {
          await this.prisma.client.user.create({
            data: { phone, telegramChatId: String(chatId) },
          });
        }
      } catch (err2) {
        this.logger.error(
          'Failed to upsert user when consuming transfer by phone',
          err2,
        );
      }
    }
    try {
      const otp = await this.otpService.createAndStoreOtp(phone);
      const res: any = await this.telegramService.sendOtpToChat(chatId, otp);
      if (!res || res.ok === false) {
        this.logger.warn(
          'Failed to send OTP after contact share',
          res?.error ?? res,
        );
        return { ok: false, reason: 'send_failed', error: res?.error ?? null };
      }

      await this.prisma.client.transfer.update({
        where: { id: record.id },
        data: { consumed: true },
      });

      this.logger.log(
        `Consumed transfer and sent OTP for phone=${phone} chatId=${chatId}`,
      );
      return { ok: true, sessionId: record.sessionId ?? null };
    } catch (err) {
      this.logger.error(
        'Error while creating or sending OTP in consumeTransferByPhone',
        err,
      );
      return {
        ok: false,
        reason: 'internal_error',
        error: err?.message ?? err,
      };
    }
  }

  async cleanupExpired() {
    const now = new Date();
    const res = await this.prisma.client.transfer.deleteMany({
      where: { expiresAt: { lt: now } },
    });
    this.logger.log(`Transfer cleanup removed ${res.count} expired transfers`);
  }
}
