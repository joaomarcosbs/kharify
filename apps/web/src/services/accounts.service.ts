import type { Account } from '@/types/entities'
import type { CreateAccountDto, UpdateAccountDto } from '@/types/dto'
import { api } from '@/lib/api'

export const accountsService = {
  findAll: async (): Promise<Account[]> => {
    const resp = await api.get<Account[]>('/accounts')
    return Array.isArray(resp.data) ? resp.data : []
  },

  findOne: async (id: string): Promise<Account> => {
    const resp = await api.get<Account>(`/accounts/${id}`)
    return resp.data
  },

  create: async (dto: CreateAccountDto): Promise<Account> => {
    const resp = await api.post<Account>('/accounts', dto)
    return resp.data
  },

  update: async (id: string, dto: UpdateAccountDto): Promise<Account> => {
    const resp = await api.patch<Account>(`/accounts/${id}`, dto)
    return resp.data
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/accounts/${id}`)
  },

  /** Soma de todos os saldos dinâmicos */
  getTotalBalance: async (): Promise<number> => {
    const list = await accountsService.findAll()
    return list.reduce((sum, acc) => sum + (Number(acc.runtimeBalance ?? acc.initialBalance) || 0), 0)
  },
}
