import { Controller, Get, Query } from '@nestjs/common';
import { AuditService } from './audit.service';
import { OrganizationId } from '../decorators/organization.decorator';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Roles(UserRole.owner, UserRole.gestor)
  @Get()
  findAll(@OrganizationId() orgId: string, @Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    return this.auditService.findAll(orgId, parsedLimit);
  }
}
