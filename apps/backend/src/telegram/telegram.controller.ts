import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Logger,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { normalizePhoneToE164 } from '../utils/phone.util';
import { TelegramService } from './telegram.service';
import { TransferService } from './transfer.service';

@ApiTags('Telegram')
@Controller('telegram')
export class TelegramController {
  private readonly logger = new Logger(TelegramController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly transferService: TransferService,
    private readonly telegramService: TelegramService,
  ) {
    this.logger.log('TelegramController initialized');
  }

  @Post('webhook')
  @ApiOperation({
    summary: 'Telegram webhook receiver / forward endpoint',
    description:
      'Receives forwarded events from the Telegram bot (or bridge). Supports contact forward and raw Telegram updates.',
  })
  @ApiHeader({
    name: 'x-telegram-bot-api-secret-token',
    description:
      'Secret token forwarded from bot bridge (optional but recommended)',
    required: false,
  })
  @ApiBody({
    description:
      'Incoming webhook payload. Valid shapes: contact forward `{ phone, chatId }`, token forward `{ token, chatId }`, or raw Telegram update object.',
  })
  @ApiResponse({ status: 200, description: 'OK — request handled.' })
  async webhook(
    @Body() update: any,
    @Headers() allHeaders?: Record<string, any>,
    @Headers('x-telegram-bot-api-secret-token') secretHeader?: string,
  ) {
    try {
      this.logger.debug(
        'Incoming webhook headers: ' + JSON.stringify(allHeaders ?? {}),
      );
      this.logger.debug(
        'Incoming explicit secretHeader: ' + String(secretHeader),
      );
      this.logger.debug('Incoming body: ' + JSON.stringify(update));

      const normalizedHeaders: Record<string, string> = {};
      for (const k of Object.keys(allHeaders ?? {})) {
        const key = String(k).toLowerCase();
        normalizedHeaders[key] = String((allHeaders as any)[k]);
      }
      const headerFromAll =
        normalizedHeaders['x-telegram-bot-api-secret-token'] ??
        normalizedHeaders['secret_token'] ??
        undefined;
      const receivedSecret = (secretHeader ?? headerFromAll ?? '')
        .toString()
        .trim();
      const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
      if (expectedSecret) {
        if (!receivedSecret || receivedSecret !== expectedSecret) {
          this.logger.warn(
            'Invalid or missing secret token on telegram webhook.',
          );
          throw new BadRequestException('Invalid secret token');
        }
      }

      if (
        update &&
        typeof update === 'object' &&
        'phone' in update &&
        'chatId' in update
      ) {
        const rawPhone = update.phone;
        const chatId = String(update.chatId);
        this.logger.log(
          `(forward) Received forward request: phone=${rawPhone}, chatId=${chatId}`,
        );
        try {
          const phone = normalizePhoneToE164(String(rawPhone));
          await this.prisma.client.user.upsert({
            where: { phone },
            create: { phone, telegramChatId: String(chatId) },
            update: { telegramChatId: String(chatId) },
          });
          this.logger.log(
            `(forward) Saved chatId ${chatId} for phone ${phone}`,
          );
        } catch (err) {
          this.logger.warn(
            `(forward) Invalid phone or save error: ${rawPhone} — ${err?.message ?? err}`,
          );
        }
        return { ok: true };
      }

      if (
        update &&
        typeof update === 'object' &&
        'token' in update &&
        'chatId' in update
      ) {
        const token = String(update.token);
        const chatId = String(update.chatId);
        this.logger.log(
          `(forward) Received transfer token from bridge: token=${token}, chatId=${chatId}`,
        );
        try {
          const res = await this.transferService.consumeTransfer(token, chatId);
          this.logger.log(
            `(forward) consumeTransfer result: ${JSON.stringify(res)}`,
          );
        } catch (err) {
          this.logger.warn(
            `(forward) consumeTransfer failed for token ${token} — ${err?.message ?? err}`,
          );
        }
        return { ok: true };
      }

      const message = update?.message ?? update?.edited_message;
      if (!message) return { ok: true };

      if (message.contact) {
        const phoneRaw = message.contact.phone_number;
        const chatId = message.from?.id ?? message.chat?.id;
        if (phoneRaw && chatId) {
          this.logger.log(
            `(telegram) Received contact from chatId=${chatId}, phone=${phoneRaw}`,
          );
          try {
            if (
              message.contact.user_id &&
              message.contact.user_id !== message.from?.id
            ) {
              this.logger.warn(
                'Contact.user_id does not match message.from.id — ignoring contact share for security',
              );
              return { ok: true };
            }

            const phone = normalizePhoneToE164(String(phoneRaw));
            const res = await this.transferService.consumeTransferByPhone(
              phone,
              String(chatId),
            );
            if (res && res.ok) {
              this.logger.log(
                `(telegram) Consumed transfer for phone=${phone} chatId=${chatId}`,
              );
            } else {
              this.logger.log(
                `(telegram) consumeTransferByPhone result: ${JSON.stringify(res)}`,
              );
            }
          } catch (err) {
            this.logger.warn(
              `(telegram) Invalid phone from contact: ${phoneRaw} — ${err?.message ?? err}`,
            );
          }
        } else {
          this.logger.warn(
            '(telegram) contact payload missing phone or chatId',
            { phoneRaw, chatId },
          );
        }
        return { ok: true };
      }

      if (typeof message.text === 'string') {
        const text = message.text.trim();
        if (text.startsWith('/start')) {
          const parts = text.split(/\s+/);
          const maybeToken = parts.length > 1 ? parts[1].trim() : '';
          const chatId = message.from?.id ?? message.chat?.id;
          if (maybeToken && chatId) {
            this.logger.log(
              `(telegram) Detected /start with token. token=${maybeToken}, chatId=${chatId}`,
            );
            try {
              const res = await this.transferService.consumeTransfer(
                maybeToken,
                String(chatId),
              );
              this.logger.log(
                `(telegram) consumeTransfer result: ${JSON.stringify(res)}`,
              );
              if (res && res.ok === false && res.error) {
                try {
                  await this.telegramService.sendOtpToChat(
                    chatId,
                    'Failed to send code. Please try again later.',
                  );
                } catch (_) {}
              }
            } catch (err) {
              this.logger.warn(
                `(telegram) Failed to consume transfer token=${maybeToken}: ${err?.message ?? err}`,
              );
              if (chatId) {
                try {
                  await this.telegramService.sendOtpToChat(
                    chatId,
                    'Failed to process your request. Please try again later.',
                  );
                } catch (_) {}
              }
            }
            return { ok: true };
          }
        }
      }

      return { ok: true };
    } catch (err) {
      this.logger.error('Telegram webhook handling error', err?.stack ?? err);
      return { ok: true };
    }
  }
}
