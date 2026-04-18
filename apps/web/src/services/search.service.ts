import type { Account, Transaction, Bill, Debt } from '@/types/entities'
import { mockAccounts } from '@/mocks/accounts'
import { mockTransactions } from '@/mocks/transactions'
import { mockBills } from '@/mocks/bills'
import { mockDebts } from '@/mocks/debts'

export interface SearchResult {
  id: string
  title: string
  subtitle?: string
  category: 'account' | 'transaction' | 'bill' | 'debt'
  url: string
}

const categoryLabels: Record<SearchResult['category'], string> = {
  account: 'Contas Bancárias',
  transaction: 'Transações',
  bill: 'Entradas / Saídas Fixas',
  debt: 'Dívidas',
}

export const searchService = {
  search: async (query: string): Promise<Record<string, SearchResult[]>> => {
    if (!query || query.length < 2) return {}

    const q = query.toLowerCase()
    const results: SearchResult[] = []

    // Search accounts
    mockAccounts
      .filter((a) => a.name.toLowerCase().includes(q))
      .forEach((a) => {
        results.push({
          id: a.id,
          title: a.name,
          subtitle: a.type,
          category: 'account',
          url: `/accounts`,
        })
      })

    // Search transactions
    mockTransactions
      .filter((t) => t.description?.toLowerCase().includes(q))
      .forEach((t) => {
        results.push({
          id: t.id,
          title: t.description || 'Sem descrição',
          subtitle: t.type,
          category: 'transaction',
          url: `/transactions`,
        })
      })

    // Search bills
    mockBills
      .filter((b) => b.description?.toLowerCase().includes(q))
      .forEach((b) => {
        results.push({
          id: b.id,
          title: b.description || 'Sem descrição',
          subtitle: b.type === 'receber' ? 'Entrada Fixa' : 'Saída Fixa',
          category: 'bill',
          url: b.type === 'receber' ? '/fixed-income' : '/fixed-expenses',
        })
      })

    // Search debts
    mockDebts
      .filter((d) => d.name.toLowerCase().includes(q))
      .forEach((d) => {
        results.push({
          id: d.id,
          title: d.name,
          subtitle: d.status,
          category: 'debt',
          url: `/debts`,
        })
      })

    // Group by category
    const grouped: Record<string, SearchResult[]> = {}
    results.forEach((r) => {
      const label = categoryLabels[r.category]
      if (!grouped[label]) grouped[label] = []
      grouped[label].push(r)
    })

    return grouped
  },
}
