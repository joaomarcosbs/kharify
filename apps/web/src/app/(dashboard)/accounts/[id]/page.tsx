"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { PageHeader } from "@/components/page-header"
import { DataTable } from "@/components/dashboard/data-table"
import { AccountBalanceChart } from "@/components/dashboard/account-balance-chart"
import type { Account, Transaction } from "@/types/entities"
import { accountsService } from "@/services/accounts.service"
import { transactionsService } from "@/services/transactions.service"
import { formatDate } from "@/lib/format"
import { useFormat } from "@/hooks/use-format"
import { ACCOUNT_TYPES, TRANSACTION_TYPES } from "@/types/enums"
import { categoriesService } from "@/services/categories.service"
import type { Category } from "@/types/entities"
import { Wallet, Landmark, CreditCard, BarChart3, ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from "lucide-react"

const typeIcons = {
  conta: Landmark,
  carteira: Wallet,
  cartao: CreditCard,
  corretora: BarChart3,
}

const typeIconColors = {
  conta: "text-violet-500 bg-violet-500/10",
  carteira: "text-amber-500 bg-amber-500/10",
  cartao: "text-rose-500 bg-rose-500/10",
  corretora: "text-emerald-500 bg-emerald-500/10",
}

const txTypeConfig = {
  entrada: { icon: ArrowDownLeft, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  saida: { icon: ArrowUpRight, color: "text-red-400", bg: "bg-red-400/10" },
  transferencia: { icon: ArrowLeftRight, color: "text-blue-400", bg: "bg-blue-400/10" },
}

export default function AccountDetailPage() {
  const params = useParams()
  const accountId = params.id as string

  const [account, setAccount] = useState<Account | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const { formatCurrency } = useFormat()

  const getCategoryName = (id?: string | null) => {
    if (!id) return "—"
    return categories.find((c) => c.id === id)?.name ?? "—"
  }

  useEffect(() => {
    async function load() {
      const [acc, allTx, cats] = await Promise.all([
        accountsService.findOne(accountId),
        transactionsService.findAll(),
        categoriesService.findAll(),
      ])
      if (acc) setAccount(acc)
      setTransactions(allTx.filter((t) => t.accountId === accountId || t.accountIdDest === accountId))
      setCategories(cats)
    }
    load()
  }, [accountId])

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
        const config = txTypeConfig[row.original.type]
        const Icon = config.icon
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${config.bg} ${config.color}`}>
            <Icon className="size-3" />
            {TRANSACTION_TYPES[row.original.type]}
          </span>
        )
      },
    },
    {
      accessorFn: (row) => getCategoryName(row.categoryId),
      id: "category",
      header: "Categoria",
      cell: ({ getValue }) => <span className="text-muted-foreground text-xs">{getValue() as string}</span>,
    },
    {
      accessorKey: "amount",
      header: "Valor",
      cell: ({ row }) => {
        const t = row.original
        return (
          <span className={`font-semibold tabular-nums ${txTypeConfig[t.type].color}`}>
            {t.type === "entrada" ? "+" : t.type === "saida" ? "-" : ""}
            {formatCurrency(t.amount)}
          </span>
        )
      },
    },
  ], [formatCurrency])

  if (!account) {
    return (
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 py-20">
        <p className="text-center text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  const Icon = typeIcons[account.type]
  const balance = account.runtimeBalance ?? account.initialBalance

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8">
      <PageHeader
        title={account.name}
        description={ACCOUNT_TYPES[account.type]}
        breadcrumbs={[
          { label: "Contas Bancárias", href: "/accounts" },
          { label: account.name },
        ]}
      />

      {/* Header card */}
      <div className="rounded-[24px] bg-background dark:bg-sidebar p-8 shadow-[0_20px_40px_-5px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.2)] transition-all duration-200">
        <div className="flex items-center gap-6">
          <div className={`size-16 rounded-2xl flex items-center justify-center ${typeIconColors[account.type]}`}>
            <Icon className="size-7" />
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Saldo Atual</p>
                <p className={`text-2xl font-semibold tracking-tight ${balance >= 0 ? "text-foreground" : "text-red-400"}`}>
                  {formatCurrency(balance)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Saldo Inicial</p>
                <p className="text-lg font-medium text-muted-foreground">{formatCurrency(account.initialBalance)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Transações</p>
                <p className="text-lg font-medium">{transactions.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Criada em</p>
                <p className="text-lg font-medium text-muted-foreground">{formatDate(account.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de evolução */}
      <AccountBalanceChart accountId={accountId} />

      {/* Transações da conta */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Transações desta conta</h2>
        <DataTable
          columns={columns}
          data={transactions}
          emptyMessage="Nenhuma transação encontrada para esta conta"
          searchKey="description"
          searchPlaceholder="Buscar transação..."
        />
      </div>
    </div>
  )
}
