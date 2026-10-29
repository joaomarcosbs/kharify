import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction } from '@prisma/client';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(
    organizationId: string,
    userId: string | null,
    tableName: string,
    action: AuditAction,
    oldData?: any,
    newData?: any,
  ) {
    try {
      await this.prisma.rls.auditLog.create({
        data: {
          organizationId,
          userId,
          tableName,
          action,
          oldData: oldData ? JSON.parse(JSON.stringify(oldData)) : undefined,
          newData: newData ? JSON.parse(JSON.stringify(newData)) : undefined,
        },
      });
    } catch (err) {
      console.error('Failed to create audit log entry:', err);
    }
  }

  async findAll(organizationId: string, limit = 50) {
    return this.prisma.rls.auditLog.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }
}
