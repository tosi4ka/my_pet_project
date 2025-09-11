import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import type express from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const frontendOrigin = process.env.FRONTEND_URL ?? 'http://localhost:3000';
  if (
    process.env.TRUST_PROXY === '1' ||
    process.env.NODE_ENV === 'production'
  ) {
    const expressApp = app
      .getHttpAdapter()
      .getInstance() as express.Application;
    expressApp.set('trust proxy', 1);
  }
  const cookieParserFactory = cookieParser as unknown as (
    ...args: unknown[]
  ) => express.RequestHandler;
  const cookieParserMiddleware = cookieParserFactory();
  app.use(cookieParserMiddleware);

  app.enableCors({
    origin: frontendOrigin,
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('My Project API')
    .setDescription('API documentation for my NestJS project')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ? +process.env.PORT : 3001);
}

void bootstrap();
