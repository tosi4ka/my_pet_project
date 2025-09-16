import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createSessionForUser(userId: string) {
    const now = new Date();

    const existing = await this.prisma.client.session.findFirst({
      where: {
        userId,
        status: 'PENDING',
        expiresAt: { gt: now },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existing) {
      this.logger.log(
        `Re-using existing session ${existing.id} for user ${userId}`,
      );
      return existing;
    }

    const ttlSec = Number(process.env.SESSION_TTL_SECONDS ?? 300);
    const expiresAt = new Date(Date.now() + ttlSec * 1000);

    const session = await this.prisma.client.session.create({
      data: {
        userId,
        expiresAt,
        status: 'PENDING',
      },
    });

    this.logger.log(`Created new session ${session.id} for user ${userId}`);
    return session;
  }

  async getById(id: string) {
    return this.prisma.client.session.findUnique({ where: { id } });
  }

  isExpired(session: { expiresAt?: Date | string | null } | null): boolean {
    if (!session) return true;
    const expiresAt = session.expiresAt ? new Date(session.expiresAt) : null;
    if (!expiresAt) return true;
    return expiresAt.getTime() <= Date.now();
  }

  async markAuthenticated(sessionId: string) {
    try {
      await this.prisma.client.session.update({
        where: { id: sessionId },
        data: { status: 'AUTHENTICATED' },
      });
      this.logger.log(`Session ${sessionId} marked AUTHENTICATED`);
    } catch (err) {
      this.logger.error('Error while marking session authenticated', err);
    }
  }

  async cleanupExpired() {
    try {
      const res = await this.prisma.client.session.updateMany({
        where: { expiresAt: { lt: new Date() }, status: 'PENDING' },
        data: { status: 'EXPIRED' },
      });
      this.logger.log(
        `Session cleanup: marked ${res.count} PENDING sessions as EXPIRED`,
      );
    } catch (err) {
      this.logger.error('Session cleanup error', err);
    }
  }
}
