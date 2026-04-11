import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { CreateTransactionDto } from './dto/transaction.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTransactionDto) {
    // 1. Domain validations
    if (dto.type === 'transferencia' && !dto.accountIdDest) {
      throw new BadRequestException('Transfer transactions require an accountIdDest');
    }
    if (dto.type === 'transferencia' && dto.accountId === dto.accountIdDest) {
      throw new BadRequestException('Cannot transfer to the same account');
    }

    const { date, ...rest } = dto;

    const rlsClient = this.prisma.rls;

    // We start a transaction to ensure Bill updates are atomic with Transaction creation
    return await rlsClient.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          ...rest,
          date: new Date(date),
        },
      });

      // 2. Cascade updating Bill status if linked
      if (transaction.billId) {
        await this.updateBillStatus(tx, transaction.billId);
      }

      return transaction;
    });
  }

  async findAll() {
    return this.prisma.rls.transaction.findMany({
      orderBy: { date: 'desc' }
    });
  }

  async remove(id: string) {
    const rlsClient = this.prisma.rls;

    return await rlsClient.$transaction(async (tx) => {
        const transaction = await tx.transaction.findUnique({ where: { id } });
        if (!transaction) throw new NotFoundException();

        await tx.transaction.delete({ where: { id } });

        if (transaction.billId) {
            await this.updateBillStatus(tx, transaction.billId);
        }
    });
  }

  /**
   * Recalculates and updates the status of a Bill based on its linked transactions
   */
  private async updateBillStatus(tx: Prisma.TransactionClient, billId: string) {
    const bill = await tx.bill.findUnique({ where: { id: billId } });
    if (!bill) return;

    // Sum all transactions linked to this bill
    const aggregate = await tx.transaction.aggregate({
      where: { billId },
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
        data: { status: newStatus }
      });
    }
  }
}
