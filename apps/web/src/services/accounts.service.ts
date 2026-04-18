import type { Account } from '@/types/entities'
import type { CreateAccountDto, UpdateAccountDto } from '@/types/dto'
import { mockAccounts } from '@/mocks/accounts'

// Cópia local mutável para simular CRUD
let accounts = [...mockAccounts]

export const accountsService = {
  findAll: async (): Promise<Account[]> => {
    return [...accounts]
  },

  findOne: async (id: string): Promise<Account> => {
    const account = accounts.find((a) => a.id === id)
    if (!account) throw new Error('Conta não encontrada')
    return { ...account }
  },

  create: async (dto: CreateAccountDto): Promise<Account> => {
    const newAccount: Account = {
      id: `acc-${Date.now()}`,
      organizationId: 'org-001',
      name: dto.name,
      type: dto.type,
      initialBalance: dto.initialBalance,
      initialBalanceDate: dto.initialBalanceDate,
      runtimeBalance: dto.initialBalance,
      createdAt: new Date().toISOString(),
    }
    accounts.push(newAccount)
    return newAccount
  },

  update: async (id: string, dto: UpdateAccountDto): Promise<Account> => {
    const index = accounts.findIndex((a) => a.id === id)
    if (index === -1) throw new Error('Conta não encontrada')
    accounts[index] = { ...accounts[index], ...dto }
    return { ...accounts[index] }
  },

  remove: async (id: string): Promise<void> => {
    accounts = accounts.filter((a) => a.id !== id)
  },

  /** Soma de todos os saldos dinâmicos */
  getTotalBalance: async (): Promise<number> => {
    return accounts.reduce((sum, acc) => sum + (acc.runtimeBalance ?? acc.initialBalance), 0)
  },
}
