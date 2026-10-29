import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(organizationId: string) {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // 1. Accounts total balance
    const accounts = await this.prisma.rls.account.findMany({
      where: { organizationId },
    });

    let totalBalance = 0;
    for (const acc of accounts) {
      const initial = Number(acc.initialBalance);
      const incomes = await this.prisma.rls.transaction.aggregate({
        where: { accountId: acc.id, organizationId, type: 'entrada' },
        _sum: { amount: true },
      });
      const expenses = await this.prisma.rls.transaction.aggregate({
        where: { accountId: acc.id, organizationId, type: { in: ['saida', 'transferencia'] } },
        _sum: { amount: true },
      });
      const transfersIn = await this.prisma.rls.transaction.aggregate({
        where: { accountIdDest: acc.id, organizationId, type: 'transferencia' },
        _sum: { amount: true },
      });

      totalBalance += initial + Number(incomes._sum.amount || 0) + Number(transfersIn._sum.amount || 0) - Number(expenses._sum.amount || 0);
    }

    // 2. Current month incomes & expenses
    const monthlyIncomeAgg = await this.prisma.rls.transaction.aggregate({
      where: {
        organizationId,
        type: 'entrada',
        date: { gte: firstDayOfMonth, lte: lastDayOfMonth },
      },
      _sum: { amount: true },
    });
    const monthlyIncome = Number(monthlyIncomeAgg._sum.amount || 0);

    const monthlyExpenseAgg = await this.prisma.rls.transaction.aggregate({
      where: {
        organizationId,
        type: { in: ['saida', 'transferencia'] },
        date: { gte: firstDayOfMonth, lte: lastDayOfMonth },
      },
      _sum: { amount: true },
    });
    const monthlyExpense = Number(monthlyExpenseAgg._sum.amount || 0);

    // 3. Pending bills
    const pendingBills = await this.prisma.rls.bill.findMany({
      where: {
        organizationId,
        status: { in: ['aberta', 'atrasada', 'parcial'] },
      },
    });

    const pendingBillsTotal = pendingBills.reduce((sum, b) => sum + Number(b.amount), 0);
    const pendingBillsCount = pendingBills.length;

    // 4. Debt balances
    const debts = await this.prisma.rls.debt.findMany({
      where: { organizationId, status: 'ativa' },
    });

    let totalDebtBalance = 0;
    for (const debt of debts) {
      const orig = Number(debt.originalAmount);
      const paidAgg = await this.prisma.rls.transaction.aggregate({
        where: { debtId: debt.id, organizationId },
        _sum: { amount: true },
      });
      const paid = Number(paidAgg._sum.amount || 0);
      totalDebtBalance += Math.max(0, orig - paid);
    }

    // 5. Kharify Health Score calculation (0 - 100)
    let healthScore = 75; // Default baseline score
    if (monthlyIncome > 0) {
      const savingsRate = Math.max(0, (monthlyIncome - monthlyExpense) / monthlyIncome);
      const debtRatio = totalDebtBalance / (monthlyIncome * 12);
      const reserveRatio = Math.min(1, totalBalance / (monthlyExpense * 6 || 1));

      healthScore = Math.round(
        Math.min(100, Math.max(0, 100 - debtRatio * 30 + savingsRate * 40 + reserveRatio * 30))
      );
    } else if (totalDebtBalance > 0 && totalBalance <= 0) {
      healthScore = 30;
    }

    return {
      totalBalance,
      monthlyIncome,
      monthlyExpense,
      pendingBillsTotal,
      pendingBillsCount,
      totalDebtBalance,
      healthScore,
    };
  }

  async getCashflowMonthly(organizationId: string) {
    const months: Array<{ month: string; income: number; expense: number }> = [];
    const now = new Date();


    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const incomesAgg = await this.prisma.rls.transaction.aggregate({
        where: {
          organizationId,
          type: 'entrada',
          date: { gte: start, lte: end },
        },
        _sum: { amount: true },
      });

      const expensesAgg = await this.prisma.rls.transaction.aggregate({
        where: {
          organizationId,
          type: { in: ['saida', 'transferencia'] },
          date: { gte: start, lte: end },
        },
        _sum: { amount: true },
      });

      const monthName = d.toLocaleString('pt-BR', { month: 'short', year: '2-digit' });

      months.push({
        month: monthName,
        income: Number(incomesAgg._sum.amount || 0),
        expense: Number(expensesAgg._sum.amount || 0),
      });
    }

    return months;
  }

  async getCategoryBreakdown(organizationId: string) {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const transactions = await this.prisma.rls.transaction.findMany({
      where: {
        organizationId,
        type: 'saida',
        date: { gte: start, lte: end },
      },
      include: {
        category: true,
      },
    });

    const categoryMap = new Map<string, { id: string; name: string; amount: number }>();

    for (const t of transactions) {
      const catName = t.category?.name || 'Sem Categoria';
      const catId = t.categoryId || 'uncategorized';
      const existing = categoryMap.get(catId) || { id: catId, name: catName, amount: 0 };
      existing.amount += Number(t.amount);
      categoryMap.set(catId, existing);
    }

    return Array.from(categoryMap.values()).sort((a, b) => b.amount - a.amount);
  }

  async getCostCenterBreakdown(organizationId: string) {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const transactions = await this.prisma.rls.transaction.findMany({
      where: {
        organizationId,
        date: { gte: start, lte: end },
      },
      include: {
        costCenter: true,
      },
    });

    const costCenterMap = new Map<string, { id: string; name: string; type?: string; income: number; expense: number }>();

    for (const t of transactions) {
      const ccName = t.costCenter?.name || 'Geral';
      const ccId = t.costCenterId || 'general';
      const ccType = t.costCenter?.type;
      const existing = costCenterMap.get(ccId) || { id: ccId, name: ccName, type: ccType, income: 0, expense: 0 };

      if (t.type === 'entrada') {
        existing.income += Number(t.amount);
      } else {
        existing.expense += Number(t.amount);
      }
      costCenterMap.set(ccId, existing);
    }

    return Array.from(costCenterMap.values());
  }
}
