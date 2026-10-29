import type { Transaction } from '@/types/entities'
import type { CreateTransactionDto } from '@/types/dto'
import { api } from '@/lib/api'

export const transactionsService = {
  findAll: async (): Promise<Transaction[]> => {
    const resp = await api.get<Transaction[]>('/transactions')
    const list = Array.isArray(resp.data) ? resp.data : []
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  },

  create: async (dto: CreateTransactionDto): Promise<Transaction> => {
    const resp = await api.post<Transaction>('/transactions', dto)
    return resp.data
  },

  update: async (id: string, dto: Partial<CreateTransactionDto>): Promise<Transaction> => {
    const resp = await api.patch<Transaction>(`/transactions/${id}`, dto)
    return resp.data
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/transactions/${id}`)
  },

  /** Soma de entradas do mês atual */
  getMonthlyIncome: async (): Promise<number> => {
    const list = await transactionsService.findAll()
    const now = new Date()
    return list
      .filter((t) => t.type === 'entrada' && new Date(t.date).getMonth() === now.getMonth() && new Date(t.date).getFullYear() === now.getFullYear())
      .reduce((sum, t) => sum + Number(t.amount), 0)
  },

  /** Soma de saídas do mês atual */
  getMonthlyExpenses: async (): Promise<number> => {
    const list = await transactionsService.findAll()
    const now = new Date()
    return list
      .filter((t) => t.type === 'saida' && new Date(t.date).getMonth() === now.getMonth() && new Date(t.date).getFullYear() === now.getFullYear())
      .reduce((sum, t) => sum + Number(t.amount), 0)
  },

  /** Últimas N transações */
  getRecent: async (limit: number = 5): Promise<Transaction[]> => {
    const list = await transactionsService.findAll()
    return [...list]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit)
  },
}
