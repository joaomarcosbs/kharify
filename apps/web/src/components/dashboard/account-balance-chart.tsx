"use client"

import { useMemo, useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { Transaction } from "@/types/entities"

const chartConfig = {
  saldo: { label: "Saldo", color: "oklch(0.72 0.17 152)" },
} satisfies ChartConfig

type Period = "7d" | "30d" | "90d" | "6m"
const periodLabels: Record<Period, string> = {
  "7d": "7 dias",
  "30d": "30 dias",
  "90d": "90 dias",
  "6m": "6 meses",
}

interface AccountBalanceChartProps {
  accountId: string
  initialBalance: number
  initialBalanceDate: string
  transactions: Transaction[]
}

function startOfDay(date: Date) {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

function endOfDay(date: Date) {
  const result = new Date(date)
  result.setHours(23, 59, 59, 999)
  return result
}

function formatPointDate(date: Date, period: Period) {
  if (period === "6m") return date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
}

export function AccountBalanceChart({ accountId, initialBalance, initialBalanceDate, transactions }: AccountBalanceChartProps) {
  const [period, setPeriod] = useState<Period>("30d")

  const data = useMemo(() => {
    const today = startOfDay(new Date())
    const initialDate = startOfDay(new Date(initialBalanceDate))
    const sortedTransactions = transactions
      .map((transaction) => ({ ...transaction, amount: Number(transaction.amount) || 0, date: new Date(transaction.date) }))
      .filter((transaction) => !Number.isNaN(transaction.date.getTime()))
      .sort((a, b) => a.date.getTime() - b.date.getTime())

    const dates: Date[] = []
    if (period === "6m") {
      for (let index = 5; index >= 0; index -= 1) {
        dates.push(new Date(today.getFullYear(), today.getMonth() - index, 1))
      }
    } else {
      const pointCount = period === "7d" ? 7 : period === "30d" ? 30 : 13
      const stepDays = period === "90d" ? 7 : 1
      const start = new Date(today)
      start.setDate(start.getDate() - (pointCount - 1) * stepDays)
      for (let index = 0; index < pointCount; index += 1) {
        const date = new Date(start)
        date.setDate(start.getDate() + index * stepDays)
        dates.push(date)
      }
    }

    const visibleDates = dates.filter((date) => date >= initialDate)
    if (visibleDates.length === 0) visibleDates.push(today)

    return visibleDates.map((date) => {
      const cutoff = endOfDay(date)
      const saldo = sortedTransactions.reduce((balance, transaction) => {
        if (transaction.date < initialDate || transaction.date > cutoff) return balance
        if (transaction.type === "entrada" && transaction.accountId === accountId) return balance + transaction.amount
        if (transaction.type === "saida" && transaction.accountId === accountId) return balance - transaction.amount
        if (transaction.type === "transferencia" && transaction.accountId === accountId) return balance - transaction.amount
        if (transaction.type === "transferencia" && transaction.accountIdDest === accountId) return balance + transaction.amount
        return balance
      }, Number(initialBalance) || 0)

      return { date: formatPointDate(date, period), saldo }
    })
  }, [accountId, initialBalance, initialBalanceDate, period, transactions])

  return (
    <div className="rounded-[24px] border-none bg-background dark:bg-sidebar p-6 shadow-[0_20px_40px_-5px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.2)] flex flex-col gap-4 relative overflow-hidden transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-base">Evolução do Saldo</h3>
          <p className="text-[14px] text-muted-foreground mt-0.5">Calculado a partir das transações desta conta</p>
        </div>
        <div className="flex gap-1 bg-muted/60 rounded-xl p-1">
          {(Object.keys(periodLabels) as Period[]).map((value) => (
            <button key={value} onClick={() => setPeriod(value)} className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${period === value ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {periodLabels[value]}
            </button>
          ))}
        </div>
      </div>

      <ChartContainer config={chartConfig} className="min-h-[220px] max-h-[220px] w-full">
        <AreaChart accessibilityLayer data={data}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/30" />
          <XAxis dataKey="date" tickLine={false} tickMargin={8} axisLine={false} tick={{ fontSize: 13, fill: "currentColor" }} />
          <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `R$${(value / 1000).toFixed(1)}k`} tick={{ fontSize: 13, fill: "currentColor" }} />
          <ChartTooltip content={<ChartTooltipContent formatter={(value) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value))} />} />
          <defs>
            <linearGradient id="fillSaldo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-saldo)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-saldo)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <Area dataKey="saldo" type="monotone" fill="url(#fillSaldo)" stroke="var(--color-saldo)" strokeWidth={2} />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}
