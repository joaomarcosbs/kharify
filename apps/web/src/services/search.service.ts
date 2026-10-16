import { accountsService } from '@/services/accounts.service'
import { transactionsService } from '@/services/transactions.service'
import { billsService } from '@/services/bills.service'
import { debtsService } from '@/services/debts.service'

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

    const [accounts, transactions, bills, debts] = await Promise.all([
      accountsService.findAll().catch(() => []),
      transactionsService.findAll().catch(() => []),
      billsService.findAll().catch(() => []),
      debtsService.findAll().catch(() => []),
    ])

    const q = query.toLowerCase()
    const results: SearchResult[] = []

    // Search accounts
    accounts
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
    transactions
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
    bills
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
    debts
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
