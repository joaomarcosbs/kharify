import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { CreateCostCenterDto, UpdateCostCenterDto } from './dto/cost-center.dto';

@Injectable()
export class CostCentersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(organizationId: string, dto: CreateCostCenterDto) {
    return this.prisma.rls.costCenter.create({
      data: {
        name: dto.name,
        type: dto.type,
        organizationId,
      },
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.rls.costCenter.findMany({
      where: { organizationId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(organizationId: string, id: string) {
    const costCenter = await this.prisma.rls.costCenter.findFirst({
      where: { id, organizationId },
    });

    if (!costCenter) {
      throw new NotFoundException('Cost center not found');
    }

    return costCenter;
  }

  async update(organizationId: string, id: string, dto: UpdateCostCenterDto) {
    await this.findOne(organizationId, id);

    return this.prisma.rls.costCenter.update({
      where: { id },
      data: dto,
    });
  }

  async remove(organizationId: string, id: string) {
    await this.findOne(organizationId, id);
    await this.prisma.rls.costCenter.delete({ where: { id } });
  }
}
