import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(organizationId: string, dto: CreateCategoryDto) {
    return this.prisma.rls.category.create({
      data: {
        name: dto.name,
        kind: dto.kind,
        groupType: dto.groupType,
        organizationId,
      },
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.rls.category.findMany({
      where: { organizationId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(organizationId: string, id: string) {
    const category = await this.prisma.rls.category.findFirst({
      where: { id, organizationId },
    });

    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(organizationId: string, id: string, dto: UpdateCategoryDto) {
    await this.findOne(organizationId, id);

    return this.prisma.rls.category.update({
      where: { id },
      data: dto,
    });
  }

  async remove(organizationId: string, id: string) {
    await this.findOne(organizationId, id);
    await this.prisma.rls.category.delete({ where: { id } });
  }
}
