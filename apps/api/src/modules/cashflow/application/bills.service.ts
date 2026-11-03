import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { CreateBillDto, UpdateBillDto } from './dto/bill.dto';

@Injectable()
export class BillsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(organizationId: string, dto: CreateBillDto) {
    await this.validateRelations(organizationId, dto);

    return this.prisma.rls.bill.create({
      data: {
        type: dto.type,
        accountId: dto.accountId,
        categoryId: dto.categoryId,
        costCenterId: dto.costCenterId,
        amount: dto.amount,
        dueDate: new Date(dto.dueDate),
        status: dto.status || 'aberta',
        recurrence: dto.recurrence || 'nenhuma',
        description: dto.description,
        organizationId,
      },
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.rls.bill.findMany({
      where: { organizationId },
      orderBy: { dueDate: 'asc' },
      include: {
        account: true,
        category: true,
        costCenter: true,
      },
    });
  }

  async findOne(organizationId: string, id: string) {
    const bill = await this.prisma.rls.bill.findFirst({
      where: { id, organizationId },
      include: {
        account: true,
        category: true,
        costCenter: true,
        transactions: true,
      },
    });

    if (!bill) throw new NotFoundException('Bill not found');
    return bill;
  }

  async update(organizationId: string, id: string, dto: UpdateBillDto) {
    await this.findOne(organizationId, id);
    await this.validateRelations(organizationId, dto);

    return this.prisma.rls.bill.update({
      where: { id },
      data: {
        type: dto.type,
        accountId: dto.accountId,
        categoryId: dto.categoryId,
        costCenterId: dto.costCenterId,
        amount: dto.amount,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        status: dto.status,
        recurrence: dto.recurrence,
        description: dto.description,
      },
    });
  }

  async remove(organizationId: string, id: string) {
    await this.findOne(organizationId, id);
    await this.prisma.rls.bill.delete({ where: { id } });
  }

  private async validateRelations(
    organizationId: string,
    dto: Partial<CreateBillDto | UpdateBillDto>,
  ) {
    if (dto.accountId) {
      const acc = await this.prisma.rls.account.findFirst({
        where: { id: dto.accountId, organizationId },
      });
      if (!acc)
        throw new BadRequestException('Account not found in this organization');
    }

    if (dto.categoryId) {
      const cat = await this.prisma.rls.category.findFirst({
        where: { id: dto.categoryId, organizationId },
      });
      if (!cat)
        throw new BadRequestException(
          'Category not found in this organization',
        );
    }

    if (dto.costCenterId) {
      const cc = await this.prisma.rls.costCenter.findFirst({
        where: { id: dto.costCenterId, organizationId },
      });
      if (!cc)
        throw new BadRequestException(
          'Cost center not found in this organization',
        );
    }
  }
}
