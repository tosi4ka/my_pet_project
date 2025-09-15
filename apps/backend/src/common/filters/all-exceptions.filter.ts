// import {
//   ArgumentsHost,
//   Catch,
//   ExceptionFilter,
//   HttpException,
//   HttpStatus,
//   Logger,
// } from '@nestjs/common';
// import type { Request, Response } from 'express';

// @Catch()
// export class AllExceptionsFilter implements ExceptionFilter {
//   private readonly logger = new Logger(AllExceptionsFilter.name);

//   catch(exception: unknown, host: ArgumentsHost) {
//     const ctx = host.switchToHttp();
//     const res = ctx.getResponse<Response>();
//     const req = ctx.getRequest<Request>();

//     const isHttp = exception instanceof HttpException;
//     const status = isHttp
//       ? (exception as HttpException).getStatus()
//       : HttpStatus.INTERNAL_SERVER_ERROR;

//     const response = isHttp
//       ? (exception as HttpException).getResponse()
//       : { message: (exception as any)?.message ?? 'Internal server error' };

//     this.logger.error({
//       path: req.url,
//       method: req.method,
//       error: exception,
//       stack: (exception as any)?.stack,
//     });

//     const isProd = process.env.NODE_ENV === 'production';
//     const body: any = {
//       statusCode: status,
//       timestamp: new Date().toISOString(),
//       path: req.url,
//       error: response,
//     };

//     if (!isProd) {
//       body.stack = (exception as any)?.stack;
//     }

//     res.status(status).json(body);
//   }
// }

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? (exception as HttpException).getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';
    if (isHttp) {
      const response = (exception as HttpException).getResponse();
      if (typeof response === 'string') {
        message = response;
      } else if (response && typeof response === 'object') {
        const maybeMessage = (response as any).message;
        if (Array.isArray(maybeMessage)) {
          message = maybeMessage.join(', ');
        } else if (typeof maybeMessage === 'string') {
          message = maybeMessage;
        } else if ((response as any).error) {
          message = String((response as any).error);
        }
      }
    } else if ((exception as any)?.message) {
      message = String((exception as any).message);
    }

    this.logger.error(
      `${req.method} ${req.url} -> ${message}`,
      (exception as any)?.stack ?? JSON.stringify(exception),
    );

    res.status(status).json({
      statusCode: status,
      message,
    });
  }
}
