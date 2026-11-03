import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { CreateDebtDto, UpdateDebtDto, SimulateDebtDto } from './dto/debt.dto';
import { DebtEntity, AmortizationRow } from '../domain/debt.entity';

@Injectable()
export class DebtsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(organizationId: string, dto: CreateDebtDto) {
    if (dto.accountId) {
      const acc = await this.prisma.rls.account.findFirst({
        where: { id: dto.accountId, organizationId },
      });
      if (!acc)
        throw new BadRequestException('Account not found in this organization');
    }

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
        organizationId,
      },
    });
  }

  async findAll(organizationId: string) {
    const debts = await this.prisma.rls.debt.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });

    return Promise.all(
      debts.map(async (debt) => {
        const balance = await this.getCurrentBalance(
          organizationId,
          debt.id,
          Number(debt.originalAmount),
        );
        return { ...debt, currentBalance: balance };
      }),
    );
  }

  async findOne(organizationId: string, id: string) {
    const debt = await this.prisma.rls.debt.findFirst({
      where: { id, organizationId },
    });
    if (!debt) throw new NotFoundException('Debt not found');

    const balance = await this.getCurrentBalance(
      organizationId,
      debt.id,
      Number(debt.originalAmount),
    );
    return { ...debt, currentBalance: balance };
  }

  async update(organizationId: string, id: string, dto: UpdateDebtDto) {
    await this.findOne(organizationId, id);

    if (dto.accountId) {
      const acc = await this.prisma.rls.account.findFirst({
        where: { id: dto.accountId, organizationId },
      });
      if (!acc)
        throw new BadRequestException('Account not found in this organization');
    }

    const updated = await this.prisma.rls.debt.update({
      where: { id },
      data: {
        name: dto.name,
        accountId: dto.accountId,
        originalAmount: dto.originalAmount,
        interestRateMonth: dto.interestRateMonth,
        totalInstallments: dto.totalInstallments,
        installmentAmount: dto.installmentAmount,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        status: dto.status,
      },
    });

    return this.findOne(organizationId, updated.id);
  }

  async remove(organizationId: string, id: string) {
    await this.findOne(organizationId, id);
    await this.prisma.rls.debt.delete({ where: { id } });
  }

  async simulate(
    organizationId: string,
    id: string,
    dto: SimulateDebtDto,
  ): Promise<AmortizationRow[]> {
    const debt = await this.findOne(organizationId, id);

    const balance = debt.currentBalance;
    const interestRate = Number(debt.interestRateMonth || 0);

    if (dto.simulationType === 'targetMonths') {
      if (!dto.targetMonths)
        throw new BadRequestException('Target months required');
      return DebtEntity.simulateByTargetMonths(
        balance,
        interestRate,
        dto.targetMonths,
      );
    }

    if (dto.simulationType === 'extraPayment') {
      if (!dto.extraPaymentAmount)
        throw new BadRequestException('Extra PMT amount required');
      const baseInstallment = Number(debt.installmentAmount || 0);
      if (baseInstallment <= 0 && interestRate > 0) {
        throw new BadRequestException(
          'Cannot simulate extra payments on a debt without a base installment defined',
        );
      }
      return DebtEntity.simulateByBonusPayment(
        balance,
        interestRate,
        baseInstallment,
        dto.extraPaymentAmount,
      );
    }

    return [];
  }

  private async getCurrentBalance(
    organizationId: string,
    debtId: string,
    originalAmount: number,
  ): Promise<number> {
    const aggregate = await this.prisma.rls.transaction.aggregate({
      where: { debtId, organizationId },
      _sum: { amount: true },
    });
    const paid = Number(aggregate._sum.amount || 0);
    return Math.max(0, originalAmount - paid);
  }
}
