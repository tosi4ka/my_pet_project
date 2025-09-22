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

  async findActiveSessionForUser(userId: string) {
    const now = new Date();
    const session = await this.prisma.client.session.findFirst({
      where: {
        userId,
        expiresAt: { gt: now },
        OR: [{ status: 'PENDING' }, { status: 'AUTHENTICATED' }],
      },
      orderBy: { createdAt: 'desc' },
    });
    return session;
  }

  async getById(id: string) {
    return this.prisma.client.session.findUnique({ where: { id } });
  }

  async getByIdWithUser(id: string) {
    return this.prisma.client.session.findUnique({
      where: { id },
      include: { user: true },
    });
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

  async expireById(sessionId: string) {
    try {
      await this.prisma.client.session.update({
        where: { id: sessionId },
        data: { status: 'EXPIRED', expiresAt: new Date(0) },
      });
      this.logger.log(`Session ${sessionId} expired`);
    } catch (err) {
      this.logger.error('Error while expiring session', err);
    }
  }

  async expireByUserId(userId: string) {
    try {
      const res = await this.prisma.client.session.updateMany({
        where: { userId, status: { in: ['PENDING', 'AUTHENTICATED'] } },
        data: { status: 'EXPIRED', expiresAt: new Date(0) },
      });
      this.logger.log(`Expired ${res.count} sessions for user ${userId}`);
    } catch (err) {
      this.logger.error('Error while expiring sessions by userId', err);
    }
  }

  async touchSession(sessionId: string, ttlSec?: number) {
    try {
      const now = Date.now();
      const ttl = Number(ttlSec ?? process.env.SESSION_TTL_SECONDS ?? 300);
      const newExpiry = new Date(now + ttl * 1000);

      const updated = await this.prisma.client.session.updateMany({
        where: {
          id: sessionId,
          expiresAt: { gt: new Date() },
        },
        data: { expiresAt: newExpiry },
      });

      if (updated.count > 0) {
        this.logger.debug(
          `Touched session ${sessionId}, new expiresAt=${newExpiry.toISOString()}`,
        );
        return true;
      } else {
        this.logger.debug(
          `Session ${sessionId} not touched (likely expired or not found)`,
        );
        return false;
      }
    } catch (err) {
      this.logger.error('Error while touching session', err);
      return false;
    }
  }

  async cleanupExpired() {
    try {
      const now = new Date();
      const res = await this.prisma.client.session.updateMany({
        where: {
          expiresAt: { lt: now },
          status: { in: ['PENDING', 'AUTHENTICATED'] },
        },
        data: { status: 'EXPIRED' },
      });
      this.logger.log(
        `Session cleanup: marked ${res.count} sessions as EXPIRED`,
      );
      return res;
    } catch (err) {
      this.logger.error('Session cleanup error', err);
      throw err;
    }
  }
}
