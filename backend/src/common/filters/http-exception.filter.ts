import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';
    let errorName = 'InternalServerError';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, unknown>;
        message = (resObj.message as string | object) || exception.message;
        errorName = (resObj.error as string) || exception.name;
      } else {
        message = res;
        errorName = exception.name;
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        `Unhandled Exception on ${request.method} ${request.url}: ${exception.message}`,
        exception.stack,
      );
      message =
        process.env.NODE_ENV === 'production'
          ? 'Internal server error'
          : exception.message;
      errorName = exception.name;
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error: errorName,
      message,
    });
  }
}
