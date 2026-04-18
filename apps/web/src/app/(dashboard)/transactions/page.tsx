"use client"

import { useEffect, useState, useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { PageHeader } from "@/components/page-header"
import { DataTable } from "@/components/dashboard/data-table"
import type { Transaction } from "@/types/entities"
import { transactionsService } from "@/services/transactions.service"
import { formatCurrency, formatDate } from "@/lib/format"
import { TRANSACTION_TYPES } from "@/types/enums"
import { mockCategories } from "@/mocks/categories"
import { mockAccounts } from "@/mocks/accounts"
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from "lucide-react"
import { TransactionFormSheet } from "@/components/forms/transaction-form-sheet"
import { TopCategoriesChart } from "@/components/dashboard/top-categories-chart"

const typeConfig = {
  entrada: { icon: ArrowDownLeft, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  saida: { icon: ArrowUpRight, color: "text-red-400", bg: "bg-red-400/10" },
  transferencia: { icon: ArrowLeftRight, color: "text-blue-400", bg: "bg-blue-400/10" },
}

const getCategoryName = (id?: string | null) => {
  if (!id) return "—"
  return mockCategories.find((c) => c.id === id)?.name ?? "—"
}

const getAccountName = (id: string) => {
  return mockAccounts.find((a) => a.id === id)?.name ?? "—"
}

export default function TransacoesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    transactionsService.findAll().then(setTransactions)
  }, [])

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
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${config.bg} ${config.color}`}>
            <Icon className="size-3" />
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
      cell: ({ getValue }) => <span className="text-muted-foreground text-xs">{getValue() as string}</span>,
    },
    {
      accessorFn: (row) => getAccountName(row.accountId),
      id: "account",
      header: "Conta",
      cell: ({ getValue }) => <span className="text-xs">{getValue() as string}</span>,
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
  ], [])

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8">
      <PageHeader
        title="Transações"
        description="Histórico de todas as movimentações financeiras."
        actions={<TransactionFormSheet />}
      />

      {/* Gráfico top categorias */}
      <TopCategoriesChart />

      {/* Tabela */}
      <DataTable
        columns={columns}
        data={transactions}
        emptyMessage="Nenhuma transação encontrada"
        searchKey="description"
        searchPlaceholder="Buscar por descrição..."
      />
    </div>
  )
}
