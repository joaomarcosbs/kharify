import type { Debt, SimulationResult } from '@/types/entities'
import type { CreateDebtDto, SimulateDebtDto } from '@/types/dto'
import { mockDebts, mockSimulationPrice, mockSimulationSAC } from '@/mocks/debts'

let debts = [...mockDebts]

export const debtsService = {
  findAll: async (): Promise<Debt[]> => {
    return [...debts]
  },

  findOne: async (id: string): Promise<Debt> => {
    const debt = debts.find((d) => d.id === id)
    if (!debt) throw new Error('Dívida não encontrada')
    return { ...debt }
  },

  create: async (dto: CreateDebtDto): Promise<Debt> => {
    const newDebt: Debt = {
      id: `debt-${Date.now()}`,
      organizationId: 'org-001',
      name: dto.name,
      accountId: dto.accountId ?? null,
      originalAmount: dto.originalAmount,
      interestRateMonth: dto.interestRateMonth ?? null,
      totalInstallments: dto.totalInstallments ?? null,
      installmentAmount: dto.installmentAmount ?? null,
      startDate: dto.startDate,
      status: dto.status,
      currentBalance: dto.originalAmount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    debts.push(newDebt)
    return newDebt
  },

  simulate: async (_id: string, dto: SimulateDebtDto): Promise<SimulationResult> => {
    // Retorna resultados mockados baseado no tipo de simulação
    if (dto.simulationType === 'sac') {
      return { ...mockSimulationSAC }
    }
    return { ...mockSimulationPrice }
  },

  /** Total devido de todas as dívidas ativas */
  getTotalDebt: async (): Promise<number> => {
    return debts
      .filter((d) => d.status === 'ativa')
      .reduce((sum, d) => sum + d.currentBalance, 0)
  },
}
