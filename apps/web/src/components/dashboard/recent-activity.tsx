"use client"

import { useEffect, useState } from "react"
import type { Transaction } from "@/types/entities"
import { transactionsService } from "@/services/transactions.service"
import { useFormat } from "@/hooks/use-format"
import { TRANSACTION_TYPES } from "@/types/enums"
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from "lucide-react"

const typeIcons = {
  entrada: ArrowDownLeft,
  saida: ArrowUpRight,
  transferencia: ArrowLeftRight,
}

const typeColors = {
  entrada: "text-emerald-500 bg-emerald-500/10",
  saida: "text-red-400 bg-red-400/10",
  transferencia: "text-blue-400 bg-blue-400/10",
}

const amountColors = {
  entrada: "text-emerald-500",
  saida: "text-red-400",
  transferencia: "text-blue-400",
}

export function RecentActivity() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const { formatCurrency } = useFormat()

  useEffect(() => {
    transactionsService.getRecent(5).then(setTransactions)
  }, [])

  return (
    <div className="rounded-[32px] border-none bg-background dark:bg-sidebar p-8 shadow-[0_20px_40px_-5px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.2)] flex flex-col gap-6 relative overflow-hidden transition-all duration-200">
      <div>
        <h3 className="font-semibold text-xl">Atividade Recente</h3>
        <p className="text-sm text-muted-foreground mt-1">Últimas movimentações</p>
      </div>
      <div className="flex flex-col gap-4">
        {transactions.map((txn) => {
          const Icon = typeIcons[txn.type]
          return (
            <div key={txn.id} className="flex gap-4 items-center">
              <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center ${typeColors[txn.type]}`}>
                <Icon className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="text-sm font-medium truncate">{txn.description || TRANSACTION_TYPES[txn.type]}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(txn.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                </span>
              </div>
              <span className={`text-sm font-semibold tabular-nums ${amountColors[txn.type]}`}>
                {txn.type === "entrada" ? "+" : txn.type === "saida" ? "-" : ""}{formatCurrency(txn.amount)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
