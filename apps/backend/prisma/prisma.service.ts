import {
  INestApplication,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaWrapper } from './prisma.client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly wrapper = new PrismaWrapper();

  async onModuleInit(): Promise<void> {
    await this.wrapper.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.wrapper.disconnect();
  }

  enableShutdownHooks(app: INestApplication): void {
    this.wrapper.enableShutdownHooks(app);
  }

  get client() {
    return this.wrapper.prisma;
  }
}
