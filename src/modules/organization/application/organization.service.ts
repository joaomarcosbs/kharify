import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { CreateOrganizationDto, UpdateOrganizationDto, AddMemberDto } from './dto/organization.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForUser(userId: string) {
    const roles = await this.prisma.userOrganizationRole.findMany({
      where: { userId },
      include: {
        organization: true,
      },
    });

    return roles.map((r) => ({
      ...r.organization,
      userRole: r.role,
    }));
  }

  async getActiveOrganization(organizationId: string, userId: string) {
    const role = await this.prisma.userOrganizationRole.findUnique({
      where: {
        userId_organizationId: { userId, organizationId },
      },
      include: {
        organization: true,
      },
    });

    if (!role) {
      throw new NotFoundException('Organization not found or access denied');
    }

    return {
      ...role.organization,
      userRole: role.role,
    };
  }

  async create(userId: string, dto: CreateOrganizationDto) {
    return this.prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: dto.name,
          type: dto.type,
          document: dto.document,
        },
      });

      await tx.userOrganizationRole.create({
        data: {
          userId,
          organizationId: org.id,
          role: UserRole.owner,
        },
      });

      return {
        ...org,
        userRole: UserRole.owner,
      };
    });
  }

  async update(organizationId: string, dto: UpdateOrganizationDto) {
    return this.prisma.organization.update({
      where: { id: organizationId },
      data: dto,
    });
  }

  async remove(organizationId: string) {
    await this.prisma.organization.delete({
      where: { id: organizationId },
    });
  }

  async getMembers(organizationId: string) {
    const members = await this.prisma.userOrganizationRole.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });

    return members.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
      role: m.role,
      joinedAt: m.user.createdAt,
    }));
  }

  async addMember(organizationId: string, dto: AddMemberDto) {
    const targetUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!targetUser) {
      throw new NotFoundException(`User with email "${dto.email}" not found`);
    }

    const existingRole = await this.prisma.userOrganizationRole.findUnique({
      where: {
        userId_organizationId: {
          userId: targetUser.id,
          organizationId,
        },
      },
    });

    if (existingRole) {
      throw new ConflictException('User is already a member of this organization');
    }

    return this.prisma.userOrganizationRole.create({
      data: {
        userId: targetUser.id,
        organizationId,
        role: dto.role,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }
}
