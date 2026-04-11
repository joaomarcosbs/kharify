import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { CreateDebtDto, SimulateDebtDto } from './dto/debt.dto';
import { DebtEntity, AmortizationRow } from '../domain/debt.entity';

@Injectable()
export class DebtsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDebtDto) {
    return this.prisma.rls.debt.create({
      data: {
        name: dto.name,
        accountId: dto.accountId,
        originalAmount: dto.originalAmount,
        interestRateMonth: dto.interestRateMonth,
        totalInstallments: dto.totalInstallments,
        installmentAmount: dto.installmentAmount,
        startDate: new Date(dto.startDate),
        status: dto.status,
      },
    });
  }

  async findAll() {
    const debts = await this.prisma.rls.debt.findMany();

    // Map list with runtime current balance
    return Promise.all(debts.map(async (debt) => {
      const balance = await this.getCurrentBalance(debt.id, Number(debt.originalAmount));
      return { ...debt, currentBalance: balance };
    }));
  }

  async findOne(id: string) {
    const debt = await this.prisma.rls.debt.findUnique({ where: { id } });
    if (!debt) throw new NotFoundException('Debt not found');

    const balance = await this.getCurrentBalance(debt.id, Number(debt.originalAmount));
    return { ...debt, currentBalance: balance };
  }

  async simulate(id: string, dto: SimulateDebtDto): Promise<AmortizationRow[]> {
    const debt = await this.findOne(id);

    const balance = debt.currentBalance;
    const interestRate = Number(debt.interestRateMonth || 0);

    if (dto.simulationType === 'targetMonths') {
      if (!dto.targetMonths) throw new BadRequestException('Target months required');
      return DebtEntity.simulateByTargetMonths(balance, interestRate, dto.targetMonths);
    }

    if (dto.simulationType === 'extraPayment') {
      if (!dto.extraPaymentAmount) throw new BadRequestException('Extra PMT amount required');
      const baseInstallment = Number(debt.installmentAmount || 0);
      if (baseInstallment <= 0 && interestRate > 0) {
        throw new BadRequestException('Cannot simulate extra payments on a debt without a base installment defined');
      }
      return DebtEntity.simulateByBonusPayment(balance, interestRate, baseInstallment, dto.extraPaymentAmount);
    }

    return [];
  }

  /**
   * Calculates runtime balance: Original Amount - All payments bound to this debt
   */
  private async getCurrentBalance(debtId: string, originalAmount: number): Promise<number> {
    const aggregate = await this.prisma.rls.transaction.aggregate({
      where: { debtId },
      _sum: { amount: true },
    });
    const paid = Number(aggregate._sum.amount || 0);
    return Math.max(0, originalAmount - paid);
  }
}
