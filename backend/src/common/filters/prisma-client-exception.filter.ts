import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaClientExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'A database error occurred.';
    let error = 'DatabaseError';

    switch (exception.code) {
      case 'P2002': {
        status = HttpStatus.CONFLICT;
        const target = (exception.meta?.target as string[]) || [];
        const fields = Array.isArray(target) ? target.join(', ') : String(target);
        message = `Unique constraint violation. A record with this ${fields || 'value'} already exists.`;
        error = 'Conflict';
        break;
      }

      case 'P2025': {
        status = HttpStatus.NOT_FOUND;
        message =
          (exception.meta?.cause as string) ||
          'The requested database record was not found.';
        error = 'NotFound';
        break;
      }

      case 'P2003': {
        status = HttpStatus.BAD_REQUEST;
        const field = (exception.meta?.field_name as string) || 'related record';
        message = `Foreign key constraint failed on ${field}. Operation cannot proceed because referenced records exist or are missing.`;
        error = 'RelationalIntegrityViolation';
        break;
      }

      case 'P2014': {
        status = HttpStatus.BAD_REQUEST;
        message =
          'The change you are trying to make would violate the required relation between records.';
        error = 'RelationViolation';
        break;
      }

      case 'P2022': {
        this.logger.error(
          `Database column missing error [P2022]: ${exception.message}`,
        );
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message =
          'A database schema synchronization error occurred. Please ensure migrations have been applied.';
        error = 'DatabaseConfigurationError';
        break;
      }

      default: {
        this.logger.error(
          `Unhandled Prisma Error [${exception.code}]: ${exception.message}`,
        );
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'A temporary database error occurred. Please try again shortly.';
        error = 'InternalDatabaseError';
        break;
      }
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error,
      message,
    });
  }
}
