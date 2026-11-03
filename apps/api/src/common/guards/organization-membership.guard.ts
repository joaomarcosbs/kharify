import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClsService } from 'nestjs-cls';
import { PrismaService } from '../prisma/prisma.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class OrganizationMembershipGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly cls: ClsService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId) {
      return false;
    }

    // Header override takes precedence over token's default organization
    const headerOrgId =
      request.headers['x-organization-id'] ||
      request.headers['X-Organization-Id'];

    // Se a rota for diretamente sobre uma organização com param ':id' (/organizations/:id),
    // o targetOrgId OBRIGATORIAMENTE deve ser o id da URL, impedindo bypass IDOR/BOLA via cabeçalho.
    const isDirectOrgRoute =
      request.params?.id &&
      (request.route?.path?.includes('organizations/:id') ||
        request.url?.includes('/organizations/'));

    const targetOrgId = isDirectOrgRoute
      ? request.params.id
      : (Array.isArray(headerOrgId) ? headerOrgId[0] : headerOrgId) ||
        user.organizationId;

    if (!targetOrgId) {
      throw new ForbiddenException('No active organization specified or found');
    }

    // Verify user membership and role in DB
    const membership = await this.prisma.userOrganizationRole.findUnique({
      where: {
        userId_organizationId: {
          userId: user.userId,
          organizationId: targetOrgId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'User is not a member of the requested organization',
      );
    }

    // Store in AsyncLocalStorage context for Prisma RLS and downstream request processing
    this.cls.set('organizationId', targetOrgId);
    this.cls.set('userRole', membership.role);

    // Attach to request object for easy access in controllers
    request.organizationId = targetOrgId;
    request.userRole = membership.role;

    return true;
  }
}
