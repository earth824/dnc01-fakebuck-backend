import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from '@nestjs/common';
import { Request } from 'express';
import { map, Observable } from 'rxjs';
import { SuccessResponse } from 'src/common/types/response.type';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<SuccessResponse<unknown>> {
    const request = context.switchToHttp().getRequest<Request>();
    const path = request.url;

    return next.handle().pipe(
      map((data: unknown) => ({
        success: true,
        data,
        path,
        timestamp: new Date().toISOString()
      }))
    );
  }
}
