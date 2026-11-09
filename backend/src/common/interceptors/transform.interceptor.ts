import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Prisma } from '@prisma/client';

export interface Response<T> {
  success: boolean;
  statusCode: number;
  data: T;
}

function serializeDecimals(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Check if it's a Prisma.Decimal instance
  if (Prisma.Decimal.isDecimal(obj)) {
    return obj.toString();
  }

  // Check if it's an array
  if (Array.isArray(obj)) {
    return obj.map((item) => serializeDecimals(item));
  }

  // Check if it's a Date
  if (obj instanceof Date) {
    return obj.toISOString();
  }

  // Check if it's a plain object
  if (typeof obj === 'object') {
    const transformed: Record<string, unknown> = {};
    for (const key of Object.keys(obj as Record<string, unknown>)) {
      transformed[key] = serializeDecimals(
        (obj as Record<string, unknown>)[key],
      );
    }
    return transformed;
  }

  return obj;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<unknown>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<unknown>> {
    const statusCode = context.switchToHttp().getResponse().statusCode;

    return next.handle().pipe(
      map((data) => ({
        success: true,
        statusCode,
        data: serializeDecimals(data),
      })),
    );
  }
}
