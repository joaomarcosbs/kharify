import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    return this.prisma.rls.category.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.rls.category.findMany();
  }

  async findOne(id: string) {
    const category = await this.prisma.rls.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    return this.prisma.rls.category.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.prisma.rls.category.delete({ where: { id } });
  }
}
