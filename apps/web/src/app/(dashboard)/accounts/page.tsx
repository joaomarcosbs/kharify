"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { PageHeader } from "@/components/page-header"
import { DataTable } from "@/components/dashboard/data-table"
import type { Account } from "@/types/entities"
import type { AccountType } from "@/types/enums"
import { accountsService } from "@/services/accounts.service"
import { useFormat } from "@/hooks/use-format"
import { ACCOUNT_TYPES } from "@/types/enums"
import { Wallet, Landmark, CreditCard, BarChart3, LayoutGrid, Table2 } from "lucide-react"
import { AccountFormSheet } from "@/components/forms/account-form-sheet"
import { PluggyConnectModal } from "@/components/pluggy/pluggy-connect-modal"
import { ConnectedBanksPanel } from "@/components/pluggy/connected-banks-panel"
import { RowActions } from "@/components/dashboard/row-actions"

const typeIcons = {
  conta: Landmark,
  carteira: Wallet,
  cartao: CreditCard,
  corretora: BarChart3,
}

const typeGradients = {
  conta: "from-violet-500/10 to-violet-600/5",
  carteira: "from-amber-500/10 to-amber-600/5",
  cartao: "from-rose-500/10 to-rose-600/5",
  corretora: "from-emerald-500/10 to-emerald-600/5",
}

const typeIconColors = {
  conta: "text-violet-500",
  carteira: "text-amber-500",
  cartao: "text-rose-500",
  corretora: "text-emerald-500",
}

type FilterTab = "todas" | AccountType
type ViewMode = "cards" | "table"

export default function ContasPage() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [totalBalance, setTotalBalance] = useState(0)
  const [tab, setTab] = useState<FilterTab>("todas")
  const [view, setView] = useState<ViewMode>("cards")
  const { formatCurrency } = useFormat()

  const load = useCallback(async () => {
    try {
      const [accs, total] = await Promise.all([
        accountsService.findAll(),
        accountsService.getTotalBalance(),
      ])
      setAccounts(Array.isArray(accs) ? accs : [])
      setTotalBalance(typeof total === "number" && !isNaN(total) ? total : 0)
    } catch {
      setAccounts([])
      setTotalBalance(0)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const safeAccounts = Array.isArray(accounts) ? accounts : []
  const filtered = tab === "todas" ? safeAccounts : safeAccounts.filter((a) => a && a.type === tab)

  const tabs: { label: string; value: FilterTab }[] = [
    { label: "Todas", value: "todas" },
    { label: "Contas", value: "conta" },
    { label: "Cartões", value: "cartao" },
    { label: "Carteiras", value: "carteira" },
    { label: "Corretoras", value: "corretora" },
  ]

  const columns = useMemo<ColumnDef<Account, unknown>[]>(() => [
    {
      accessorKey: "name",
      header: "Nome",
      cell: ({ row }) => {
        const a = row.original
        const Icon = typeIcons[a.type]
        return (
          <div className="flex items-center gap-3">
            <div className={`size-9 rounded-xl flex items-center justify-center bg-muted/50 ${typeIconColors[a.type]}`}>
              <Icon className="size-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{a.name}</span>
              {a.pluggyAccountId && (
                <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded-md font-semibold">
                  Open Finance
                </span>
              )}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => <span className="text-muted-foreground">{ACCOUNT_TYPES[row.original.type]}</span>,
    },
    {
      accessorKey: "initialBalance",
      header: "Saldo Inicial",
      cell: ({ row }) => <span className="tabular-nums text-muted-foreground">{formatCurrency(row.original.initialBalance)}</span>,
    },
    {
      accessorFn: (row) => row.runtimeBalance ?? row.initialBalance,
      id: "currentBalance",
      header: "Saldo Atual",
      cell: ({ row }) => {
        const balance = row.original.runtimeBalance ?? row.original.initialBalance
        return (
          <span className={`font-semibold tabular-nums ${balance >= 0 ? "text-foreground" : "text-red-400"}`}>
            {formatCurrency(balance)}
          </span>
        )
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const a = row.original
        return (
          <RowActions
            deleteConfirmMessage={`Tem certeza que deseja excluir a conta "${a.name}"?`}
            onEdit={() => setEditingAccount(a)}
            onDelete={async () => {
              await accountsService.remove(a.id)
              load()
            }}
          />
        )
      },
    },
  ], [formatCurrency, load])

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8">
      <PageHeader
        title="Contas Bancárias"
        description="Gerencie suas contas bancárias, carteiras e investimentos sincronizados via Open Finance."
        actions={
          <div className="flex items-center gap-3">
            <PluggyConnectModal onSuccess={load} />
            <AccountFormSheet onAccountCreated={load} />
          </div>
        }
      />

      {/* Painel de Instituições Conectadas via Open Finance */}
      <ConnectedBanksPanel onRefreshNeeded={load} />

      {/* Saldo total */}
      <div className="rounded-[24px] border-none bg-background dark:bg-sidebar p-8 shadow-[0_20px_40px_-5px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.2)] transition-all duration-200">
        <p className="text-sm font-semibold text-muted-foreground mb-2">Patrimônio Consolidado</p>
        <p className={`text-4xl font-semibold tracking-tighter ${totalBalance >= 0 ? "text-foreground" : "text-red-400"}`}>
          {formatCurrency(totalBalance)}
        </p>
        <p className="text-xs text-muted-foreground mt-2">Somatório de todas as contas ativas</p>
      </div>

      {/* Tabs + View Toggle */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex gap-2 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                tab === t.value
                  ? "bg-foreground text-background shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div className="flex gap-1 bg-muted/60 rounded-xl p-1">
          <button
            onClick={() => setView("cards")}
            className={`p-2 rounded-lg transition-all cursor-pointer ${
              view === "cards" ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="size-4" />
          </button>
          <button
            onClick={() => setView("table")}
            className={`p-2 rounded-lg transition-all cursor-pointer ${
              view === "table" ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Table2 className="size-4" />
          </button>
        </div>
      </div>

      {/* Cards ou Tabela */}
      {view === "cards" ? (
        filtered.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {filtered.map((account) => {
              const Icon = typeIcons[account.type] || Landmark
              const balance = account.runtimeBalance ?? account.initialBalance
              return (
                <div
                  key={account.id}
                  onClick={() => router.push(`/accounts/${account.id}`)}
                  className={`rounded-[24px] bg-linear-to-br ${typeGradients[account.type] || "from-muted/20 to-muted/10"} border border-border/30 p-8 shadow-[0_20px_40px_-5px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.2)] transition-all duration-200 hover:-translate-y-1 group cursor-pointer`}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`size-12 rounded-2xl bg-background/80 dark:bg-sidebar/80 backdrop-blur flex items-center justify-center ${typeIconColors[account.type] || "text-foreground"}`}>
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{account.name}</h3>
                          {account.pluggyAccountId && (
                            <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-semibold">
                              Open Finance
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{ACCOUNT_TYPES[account.type] || account.type}</p>
                      </div>
                    </div>
                    <RowActions
                      deleteConfirmMessage={`Tem certeza que deseja excluir a conta "${account.name}"?`}
                      onEdit={() => setEditingAccount(account)}
                      onDelete={async () => {
                        await accountsService.remove(account.id)
                        load()
                      }}
                    />
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Saldo atual</p>
                      <p className={`text-2xl font-semibold tracking-tight ${balance >= 0 ? "text-foreground" : "text-red-400"}`}>
                        {formatCurrency(balance)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">Saldo inicial</p>
                      <p className="text-sm text-muted-foreground font-medium">
                        {formatCurrency(account.initialBalance)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-border/60 bg-background/50 dark:bg-sidebar/50 p-12 text-center">
            <div className="mx-auto size-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground mb-4">
              <Landmark className="size-6" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Nenhuma conta encontrada</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
              Você ainda não possui contas cadastradas. Conecte seu banco via Open Finance ou adicione uma conta manual.
            </p>
            <div className="flex items-center justify-center gap-3">
              <AccountFormSheet onAccountCreated={load} />
              <PluggyConnectModal onSuccess={load} />
            </div>
          </div>
        )
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          emptyMessage="Nenhuma conta encontrada"
        />
      )}

      <AccountFormSheet
        initialData={editingAccount}
        open={!!editingAccount}
        onOpenChange={(open) => !open && setEditingAccount(null)}
        onAccountCreated={load}
      />
    </div>
  )
}
