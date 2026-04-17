import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { CreateBillDto, UpdateBillDto } from './dto/bill.dto';

@Injectable()
export class BillsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBillDto) {
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
      },
    });
  }

  async findAll() {
    return this.prisma.rls.bill.findMany({
      orderBy: { dueDate: 'asc' },
      include: {
        account: true,
        category: true,
        costCenter: true,
      },
    });
  }

  async findOne(id: string) {
    const bill = await this.prisma.rls.bill.findUnique({
      where: { id },
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

  async update(id: string, dto: UpdateBillDto) {
    await this.findOne(id);

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

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.rls.bill.delete({ where: { id } });
  }
}
