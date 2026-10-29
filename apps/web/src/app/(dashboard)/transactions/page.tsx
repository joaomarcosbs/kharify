"use client"

import { useEffect, useState, useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { PageHeader } from "@/components/page-header"
import { DataTable } from "@/components/dashboard/data-table"
import type { Transaction, Category, Account } from "@/types/entities"
import { transactionsService } from "@/services/transactions.service"
import { categoriesService } from "@/services/categories.service"
import { accountsService } from "@/services/accounts.service"
import { formatDate } from "@/lib/format"
import { useFormat } from "@/hooks/use-format"
import { TRANSACTION_TYPES } from "@/types/enums"
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from "lucide-react"
import { TransactionFormSheet } from "@/components/forms/transaction-form-sheet"
import { TopCategoriesChart } from "@/components/dashboard/top-categories-chart"
import { StatCard } from "@/components/dashboard/stat-card"
import { RowActions } from "@/components/dashboard/row-actions"

const typeConfig = {
  entrada: { icon: ArrowDownLeft, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  saida: { icon: ArrowUpRight, color: "text-red-400", bg: "bg-red-400/10" },
  transferencia: { icon: ArrowLeftRight, color: "text-blue-400", bg: "bg-blue-400/10" },
}

export default function TransacoesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const { formatCurrency } = useFormat()

  useEffect(() => {
    transactionsService.findAll().then(setTransactions)
    categoriesService.findAll().then(setCategories)
    accountsService.findAll().then(setAccounts)
  }, [])

  const getCategoryName = (id?: string | null) => {
    if (!id) return "—"
    return categories.find((c) => c.id === id)?.name ?? "—"
  }

  const getAccountName = (id: string) => {
    return accounts.find((a) => a.id === id)?.name ?? "—"
  }

  const totalEntradas = useMemo(() => 
    transactions.filter(t => t.type === 'entrada').reduce((acc, t) => acc + t.amount, 0),
  [transactions])

  const totalSaidas = useMemo(() => 
    transactions.filter(t => t.type === 'saida').reduce((acc, t) => acc + t.amount, 0),
  [transactions])

  const columns = useMemo<ColumnDef<Transaction, unknown>[]>(() => [
    {
      accessorKey: "date",
      header: "Data",
      cell: ({ row }) => <span className="text-muted-foreground">{formatDate(row.original.date)}</span>,
    },
    {
      accessorFn: (row) => row.description || "Sem descrição",
      id: "description",
      header: "Descrição",
      cell: ({ row }) => <span className="font-medium">{row.original.description || "Sem descrição"}</span>,
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => {
        const t = row.original
        const config = typeConfig[t.type]
        const Icon = config.icon
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[13px] font-medium ${config.bg} ${config.color}`}>
            <Icon className="size-3.5" />
            {TRANSACTION_TYPES[t.type]}
          </span>
        )
      },
      filterFn: (row, id, value) => {
        if (!value || value === "todas") return true
        return row.original.type === value
      },
    },
    {
      accessorFn: (row) => getCategoryName(row.categoryId),
      id: "category",
      header: "Categoria",
      cell: ({ getValue }) => <span className="text-muted-foreground">{getValue() as string}</span>,
    },
    {
      accessorFn: (row) => getAccountName(row.accountId),
      id: "account",
      header: "Conta",
      cell: ({ getValue }) => <span>{getValue() as string}</span>,
    },
    {
      accessorKey: "amount",
      header: "Valor",
      cell: ({ row }) => {
        const t = row.original
        return (
          <span className={`font-semibold tabular-nums ${typeConfig[t.type].color}`}>
            {t.type === "entrada" ? "+" : t.type === "saida" ? "-" : ""}
            {formatCurrency(t.amount)}
          </span>
        )
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const t = row.original
        return (
          <RowActions
            deleteConfirmMessage="Tem certeza que deseja excluir esta transação?"
            onEdit={() => setEditingTransaction(t)}
            onDelete={async () => {
              await transactionsService.remove(t.id)
              const updated = await transactionsService.findAll()
              setTransactions(updated)
            }}
          />
        )
      },
    },
  ], [formatCurrency, categories, accounts])

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8">
      <PageHeader
        title="Transações"
        description="Histórico de todas as movimentações financeiras."
        actions={<TransactionFormSheet onTransactionSaved={() => transactionsService.findAll().then(setTransactions)} />}
      />

      {/* Resumo e Gráfico */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="flex flex-col gap-4 lg:col-span-1 h-full">
          <StatCard
            className="flex-1"
            title="Total Entradas"
            value={formatCurrency(totalEntradas)}
            icon={<ArrowDownLeft />}
          />
          <StatCard
            className="flex-1"
            title="Total Saídas"
            value={formatCurrency(totalSaidas)}
            trendDirection="down"
            icon={<ArrowUpRight />}
          />
        </div>
        <div className="lg:col-span-2 h-full">
          <TopCategoriesChart />
        </div>
      </div>

      {/* Tabela */}
      <DataTable
        columns={columns}
        data={transactions}
        emptyMessage="Nenhuma transação encontrada"
        searchKey="description"
        searchPlaceholder="Buscar por descrição..."
      />

      <TransactionFormSheet
        initialData={editingTransaction}
        open={!!editingTransaction}
        onOpenChange={(open) => !open && setEditingTransaction(null)}
        onTransactionSaved={() => transactionsService.findAll().then(setTransactions)}
      />
    </div>
  )
}
