import { HttpException, Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly TTL_SECONDS = Number(process.env.OTP_TTL_SECONDS ?? 300);
  private readonly RATE_LIMIT_WINDOW = Number(
    process.env.OTP_RATE_LIMIT_WINDOW ?? 60,
  );
  private readonly RATE_LIMIT_MAX = Number(process.env.OTP_RATE_LIMIT_MAX ?? 5);
  private readonly MAX_VERIFY_TRIES = Number(
    process.env.OTP_MAX_VERIFY_TRIES ?? 5,
  );

  constructor(private readonly prisma: PrismaService) {}

  private generateNumericOtp(length = 6) {
    const min = 10 ** (length - 1);
    const max = 10 ** length - 1;
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    return String(num);
  }

  private async checkRateLimit(phone: string) {
    const windowStart = new Date(Date.now() - this.RATE_LIMIT_WINDOW * 1000);
    const cnt = await this.prisma.client.otp.count({
      where: {
        phone,
        createdAt: { gte: windowStart },
      },
    });
    if (cnt >= this.RATE_LIMIT_MAX) {
      throw new HttpException(`Too many OTP requests. Try again later.`, 429);
    }
  }

  async createAndStoreOtp(phone: string, length = 6) {
    await this.checkRateLimit(phone);

    const otp = this.generateNumericOtp(length);
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + this.TTL_SECONDS * 1000);

    await this.prisma.client.otp.create({
      data: {
        phone,
        otpHash,
        expiresAt,
        consumed: false,
        tries: 0,
      },
    });

    this.logger.debug(
      `Created OTP for ${phone}, expiresAt=${expiresAt.toISOString()}`,
    );

    return otp;
  }

  async verifyOtp(phone: string, otp: string): Promise<boolean> {
    const now = new Date();
    const record = await this.prisma.client.otp.findFirst({
      where: {
        phone,
        consumed: false,
        expiresAt: { gt: now },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) return false;

    if (record.tries >= this.MAX_VERIFY_TRIES) {
      await this.prisma.client.otp.update({
        where: { id: record.id },
        data: { consumed: true },
      });
      throw new HttpException(
        'Too many verification attempts. Try later.',
        429,
      );
    }

    const isValid = await bcrypt.compare(otp, record.otpHash);
    if (isValid) {
      await this.prisma.client.otp.update({
        where: { id: record.id },
        data: { consumed: true },
      });
      return true;
    } else {
      await this.prisma.client.otp.update({
        where: { id: record.id },
        data: { tries: { increment: 1 } },
      });
      return false;
    }
  }

  async hasActiveOtp(phone: string) {
    const now = new Date();
    const cnt = await this.prisma.client.otp.count({
      where: { phone, consumed: false, expiresAt: { gt: now } },
    });
    return cnt > 0;
  }

  async cleanupExpired() {
    const now = new Date();
    await this.prisma.client.otp.deleteMany({
      where: { expiresAt: { lt: now } },
    });
  }
}
