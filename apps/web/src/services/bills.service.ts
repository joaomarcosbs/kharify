import type { Bill } from '@/types/entities'
import type { CreateBillDto, UpdateBillDto } from '@/types/dto'
import { api } from '@/lib/api'

export const billsService = {
  findAll: async (): Promise<Bill[]> => {
    const resp = await api.get<Bill[]>('/bills')
    const list = Array.isArray(resp.data) ? resp.data : []
    return list.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  },

  findOne: async (id: string): Promise<Bill> => {
    const resp = await api.get<Bill>(`/bills/${id}`)
    return resp.data
  },

  create: async (dto: CreateBillDto): Promise<Bill> => {
    const resp = await api.post<Bill>('/bills', dto)
    return resp.data
  },

  update: async (id: string, dto: UpdateBillDto): Promise<Bill> => {
    const resp = await api.patch<Bill>(`/bills/${id}`, dto)
    return resp.data
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/bills/${id}`)
  },

  /** Bills com vencimento nos próximos N dias */
  getUpcoming: async (days: number = 7): Promise<Bill[]> => {
    const list = await billsService.findAll()
    const now = new Date()
    const limit = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
    return list.filter(
      (b) => b.status !== 'paga' && new Date(b.dueDate) >= now && new Date(b.dueDate) <= limit
    )
  },

  /** Bills atrasadas */
  getOverdue: async (): Promise<Bill[]> => {
    const list = await billsService.findAll()
    return list.filter((b) => b.status === 'atrasada')
  },
}
