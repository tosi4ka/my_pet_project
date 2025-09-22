import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();

    const headerSessionId =
      (req.headers &&
        (req.headers['x-session-id'] || req.headers['x-sessionid'])) ??
      undefined;

    // Fall back to cookie
    const cookieSessionId = req.cookies?.sessionId as string | undefined;

    const sessionId = headerSessionId
      ? String(headerSessionId)
      : cookieSessionId;
    if (!sessionId) return false;

    const session = await this.prisma.client.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });
    if (!session) return false;

    if (session.status !== 'AUTHENTICATED') return false;

    if (
      !session.expiresAt ||
      new Date(session.expiresAt).getTime() <= Date.now()
    )
      return false;

    req.user = session.user;
    req.session = session;
    return true;
  }
}
