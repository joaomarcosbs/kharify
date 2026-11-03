import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
} from './dto/transaction.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(organizationId: string, dto: CreateTransactionDto) {
    if (dto.type === 'transferencia' && !dto.accountIdDest) {
      throw new BadRequestException(
        'Transfer transactions require an accountIdDest',
      );
    }
    if (dto.type === 'transferencia' && dto.accountId === dto.accountIdDest) {
      throw new BadRequestException('Cannot transfer to the same account');
    }

    await this.validateRelations(organizationId, dto);

    const { date, ...rest } = dto;
    const rlsClient = this.prisma.rls;

    return await rlsClient.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          ...rest,
          date: new Date(date),
          organizationId,
        },
      });

      if (transaction.billId) {
        await this.updateBillStatus(tx, organizationId, transaction.billId);
      }

      return transaction;
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.rls.transaction.findMany({
      where: { organizationId },
      orderBy: { date: 'desc' },
      include: {
        account: true,
        accountDest: true,
        category: true,
        costCenter: true,
      },
    });
  }

  async update(organizationId: string, id: string, dto: UpdateTransactionDto) {
    const existing = await this.prisma.rls.transaction.findFirst({
      where: { id, organizationId },
    });
    if (!existing) throw new NotFoundException('Transaction not found');

    const { date, ...rest } = dto;
    const data: Prisma.TransactionUpdateInput = { ...rest };
    if (date) {
      data.date = new Date(date);
    }

    return this.prisma.rls.transaction.update({
      where: { id },
      data,
    });
  }

  async remove(organizationId: string, id: string) {
    const rlsClient = this.prisma.rls;

    return await rlsClient.$transaction(async (tx) => {
      const transaction = await tx.transaction.findFirst({
        where: { id, organizationId },
      });
      if (!transaction) throw new NotFoundException('Transaction not found');

      await tx.transaction.delete({ where: { id } });

      if (transaction.billId) {
        await this.updateBillStatus(tx, organizationId, transaction.billId);
      }
    });
  }

  private async validateRelations(
    organizationId: string,
    dto: CreateTransactionDto,
  ) {
    const acc = await this.prisma.rls.account.findFirst({
      where: { id: dto.accountId, organizationId },
    });
    if (!acc)
      throw new BadRequestException(
        'Source account not found in this organization',
      );

    if (dto.accountIdDest) {
      const accDest = await this.prisma.rls.account.findFirst({
        where: { id: dto.accountIdDest, organizationId },
      });
      if (!accDest)
        throw new BadRequestException(
          'Destination account not found in this organization',
        );
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

    if (dto.billId) {
      const bill = await this.prisma.rls.bill.findFirst({
        where: { id: dto.billId, organizationId },
      });
      if (!bill)
        throw new BadRequestException('Bill not found in this organization');
    }

    if (dto.debtId) {
      const debt = await this.prisma.rls.debt.findFirst({
        where: { id: dto.debtId, organizationId },
      });
      if (!debt)
        throw new BadRequestException('Debt not found in this organization');
    }
  }

  private async updateBillStatus(
    tx: Prisma.TransactionClient,
    organizationId: string,
    billId: string,
  ) {
    const bill = await tx.bill.findFirst({
      where: { id: billId, organizationId },
    });
    if (!bill) return;

    const aggregate = await tx.transaction.aggregate({
      where: { billId, organizationId },
      _sum: { amount: true },
    });

    const totalPaid = Number(aggregate._sum.amount || 0);
    const billAmount = Number(bill.amount);

    let newStatus: 'aberta' | 'parcial' | 'paga' | 'atrasada' = 'aberta';

    if (totalPaid >= billAmount) {
      newStatus = 'paga';
    } else if (totalPaid > 0) {
      newStatus = 'parcial';
    } else {
      newStatus = new Date(bill.dueDate) < new Date() ? 'atrasada' : 'aberta';
    }

    if (bill.status !== newStatus) {
      await tx.bill.update({
        where: { id: billId },
        data: { status: newStatus },
      });
    }
  }
}
