import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

const ROLE_WEIGHTS: Record<UserRole, number> = {
  [UserRole.owner]: 3,
  [UserRole.gestor]: 2,
  [UserRole.membro]: 1,
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userRole: UserRole = request.userRole;

    if (!userRole) {
      throw new ForbiddenException('User role in organization could not be verified');
    }

    const userWeight = ROLE_WEIGHTS[userRole] || 0;

    const hasPermission = requiredRoles.some((requiredRole) => {
      const requiredWeight = ROLE_WEIGHTS[requiredRole] || 0;
      return userWeight >= requiredWeight;
    });

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions for this operation');
    }

    return true;
  }
}
