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

  simulate: async (id: string, dto: SimulateDebtDto): Promise<SimulationResult> => {
    const debt = debts.find((d) => d.id === id)
    if (!debt) throw new Error('Dívida não encontrada')

    const balance = debt.currentBalance
    const rate = (debt.interestRateMonth || 1.5) / 100
    // Estimate a base installment if none exists (36 months assumption)
    const baseInstallment = debt.installmentAmount || (balance * (rate / (1 - Math.pow(1 + rate, -36))))
    
    let extra = 0
    if (dto.simulationMode === 'extraPayment') {
       extra = dto.extraPaymentAmount || 0
    }

    let current = balance
    let months = 0
    let totalInterest = 0
    const rows = []

    // SAC vs PRICE basic implementation
    const isSac = dto.simulationType === 'sac'
    const originalMonths = debt.totalInstallments || 48
    const fixedPrincipal = balance / originalMonths

    while(current > 0.01 && months < 420) { // max 35 years fail-safe
       months++
       const interest = current * rate
       let principal = 0
       let payment = 0

       if (isSac) {
           principal = fixedPrincipal + extra
           if (principal > current) principal = current
           payment = principal + interest
       } else {
           payment = baseInstallment + extra
           if (payment <= interest) {
               payment = interest + 10 // Prevent infinite loop if payment doesn't cover interest
           }
           principal = payment - interest
           if (principal > current) {
               principal = current
               payment = principal + interest
           }
       }

       totalInterest += interest
       current -= principal

       rows.push({
          monthIndex: months,
          paymentAmount: payment,
          interestPaid: interest,
          principalPaid: principal,
          remainingBalance: Math.max(0, current)
       })
    }

    return {
       simulationType: dto.simulationType,
       months,
       totalPaid: balance + totalInterest,
       totalInterest,
       rows
    }
  },

  /** Total devido de todas as dívidas ativas */
  getTotalDebt: async (): Promise<number> => {
    return debts
      .filter((d) => d.status === 'ativa')
      .reduce((sum, d) => sum + d.currentBalance, 0)
  },
}
