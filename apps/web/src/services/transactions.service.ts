import type { Transaction } from '@/types/entities'
import type { CreateTransactionDto } from '@/types/dto'
import { mockTransactions } from '@/mocks/transactions'

let transactions = [...mockTransactions]

export const transactionsService = {
  findAll: async (): Promise<Transaction[]> => {
    return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  },

  create: async (dto: CreateTransactionDto): Promise<Transaction> => {
    const newTransaction: Transaction = {
      id: `txn-${Date.now()}`,
      organizationId: 'org-001',
      type: dto.type,
      accountId: dto.accountId,
      accountIdDest: dto.accountIdDest ?? null,
      categoryId: dto.categoryId ?? null,
      costCenterId: dto.costCenterId ?? null,
      billId: dto.billId ?? null,
      debtId: dto.debtId ?? null,
      amount: dto.amount,
      date: dto.date,
      description: dto.description ?? null,
      origin: dto.origin ?? 'manual',
      createdAt: new Date().toISOString(),
    }
    transactions.push(newTransaction)
    return newTransaction
  },

  remove: async (id: string): Promise<void> => {
    transactions = transactions.filter((t) => t.id !== id)
  },

  /** Soma de entradas do mês atual */
  getMonthlyIncome: async (): Promise<number> => {
    const now = new Date()
    return transactions
      .filter((t) => t.type === 'entrada' && new Date(t.date).getMonth() === now.getMonth() && new Date(t.date).getFullYear() === now.getFullYear())
      .reduce((sum, t) => sum + t.amount, 0)
  },

  /** Soma de saídas do mês atual */
  getMonthlyExpenses: async (): Promise<number> => {
    const now = new Date()
    return transactions
      .filter((t) => t.type === 'saida' && new Date(t.date).getMonth() === now.getMonth() && new Date(t.date).getFullYear() === now.getFullYear())
      .reduce((sum, t) => sum + t.amount, 0)
  },

  /** Últimas N transações */
  getRecent: async (limit: number = 5): Promise<Transaction[]> => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit)
  },
}
