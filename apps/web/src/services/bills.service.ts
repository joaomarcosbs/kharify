import type { Bill } from '@/types/entities'
import type { CreateBillDto, UpdateBillDto } from '@/types/dto'
import { mockBills } from '@/mocks/bills'

let bills = [...mockBills]

export const billsService = {
  findAll: async (): Promise<Bill[]> => {
    return [...bills].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  },

  findOne: async (id: string): Promise<Bill> => {
    const bill = bills.find((b) => b.id === id)
    if (!bill) throw new Error('Conta não encontrada')
    return { ...bill }
  },

  create: async (dto: CreateBillDto): Promise<Bill> => {
    const newBill: Bill = {
      id: `bill-${Date.now()}`,
      organizationId: 'org-001',
      type: dto.type,
      accountId: dto.accountId ?? null,
      categoryId: dto.categoryId ?? null,
      costCenterId: dto.costCenterId ?? null,
      amount: dto.amount,
      dueDate: dto.dueDate,
      status: dto.status ?? 'aberta',
      recurrence: dto.recurrence ?? 'nenhuma',
      description: dto.description ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    bills.push(newBill)
    return newBill
  },

  update: async (id: string, dto: UpdateBillDto): Promise<Bill> => {
    const index = bills.findIndex((b) => b.id === id)
    if (index === -1) throw new Error('Conta não encontrada')
    bills[index] = { ...bills[index], ...dto, updatedAt: new Date().toISOString() }
    return { ...bills[index] }
  },

  remove: async (id: string): Promise<void> => {
    bills = bills.filter((b) => b.id !== id)
  },

  /** Bills com vencimento nos próximos N dias */
  getUpcoming: async (days: number = 7): Promise<Bill[]> => {
    const now = new Date()
    const limit = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
    return bills.filter(
      (b) => b.status !== 'paga' && new Date(b.dueDate) >= now && new Date(b.dueDate) <= limit
    )
  },

  /** Bills atrasadas */
  getOverdue: async (): Promise<Bill[]> => {
    return bills.filter((b) => b.status === 'atrasada')
  },
}
