import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly cls: ClsService) {
    super();
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    
    // Injetando no Request Lifecycle (AsyncLocalStorage) para o Client Extension do Prisma poder usufruir do RLS
    if (user.organizationId) {
      this.cls.set('organizationId', user.organizationId);
    }
    
    return user;
  }
}
