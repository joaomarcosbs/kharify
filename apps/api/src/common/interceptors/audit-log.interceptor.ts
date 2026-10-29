import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '@prisma/client';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const organizationId = request.organizationId || request.user?.organizationId;
    const userId = request.user?.userId;
    const url = request.url || '';
    const tableName = url.split('/')[2] || 'unknown';

    let action: AuditAction = AuditAction.UPDATE;
    if (method === 'POST') action = AuditAction.INSERT;
    if (method === 'DELETE') action = AuditAction.DELETE;

    const oldData = method !== 'POST' ? request.body : undefined;

    return next.handle().pipe(
      tap((responseData) => {
        if (organizationId) {
          this.auditService.log(
            organizationId,
            userId || null,
            tableName,
            action,
            oldData,
            responseData,
          );
        }
      }),
    );
  }
}
