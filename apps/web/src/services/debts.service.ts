import type { Debt, SimulationResult } from '@/types/entities'
import type { CreateDebtDto, SimulateDebtDto } from '@/types/dto'
import { api } from '@/lib/api'

export const debtsService = {
  findAll: async (): Promise<Debt[]> => {
    const resp = await api.get<Debt[]>('/debts')
    return Array.isArray(resp.data) ? resp.data : []
  },

  findOne: async (id: string): Promise<Debt> => {
    const resp = await api.get<Debt>(`/debts/${id}`)
    return resp.data
  },

  create: async (dto: CreateDebtDto): Promise<Debt> => {
    const resp = await api.post<Debt>('/debts', dto)
    return resp.data
  },

  update: async (id: string, dto: Partial<CreateDebtDto>): Promise<Debt> => {
    const resp = await api.patch<Debt>(`/debts/${id}`, dto)
    return resp.data
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/debts/${id}`)
  },

  simulate: async (id: string, dto: SimulateDebtDto): Promise<SimulationResult> => {
    const debt = await debtsService.findOne(id)
    if (!debt) throw new Error('Dívida não encontrada')

    const balance = Number(debt.currentBalance || debt.originalAmount)
    const rate = (Number(debt.interestRateMonth) || 1.5) / 100
    // Estimate a base installment if none exists (36 months assumption)
    const baseInstallment = Number(debt.installmentAmount) || (balance * (rate / (1 - Math.pow(1 + rate, -36))))
    
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
    const list = await debtsService.findAll()
    return list
      .filter((d) => d.status === 'ativa')
      .reduce((sum, d) => sum + Number(d.currentBalance || d.originalAmount), 0)
  },
}
