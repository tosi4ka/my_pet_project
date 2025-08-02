import { INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export class PrismaWrapper {
  private readonly client = new PrismaClient();

  async connect(): Promise<void> {
    await this.client.$connect();
  }

  async disconnect(): Promise<void> {
    await this.client.$disconnect();
  }

  enableShutdownHooks(app: INestApplication): void {
    // @ts-expect-error: PrismaClient
    this.client.$on('beforeExit', () => {
      void app.close();
    });
  }

  get prisma(): PrismaClient {
    return this.client;
  }
}
