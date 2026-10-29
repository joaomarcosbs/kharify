"use client"

import { useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  saldo: {
    label: "Saldo",
    color: "oklch(0.72 0.17 152)",
  },
} satisfies ChartConfig

// Dados mock simulando evolução do saldo
const mockBalanceData: Record<string, { date: string; saldo: number }[]> = {
  "7d": [
    { date: "11/04", saldo: 12800 },
    { date: "12/04", saldo: 12350 },
    { date: "13/04", saldo: 13100 },
    { date: "14/04", saldo: 12900 },
    { date: "15/04", saldo: 13400 },
    { date: "16/04", saldo: 13200 },
    { date: "17/04", saldo: 14200 },
  ],
  "30d": [
    { date: "18/03", saldo: 10500 },
    { date: "22/03", saldo: 11200 },
    { date: "26/03", saldo: 10800 },
    { date: "30/03", saldo: 11900 },
    { date: "03/04", saldo: 12100 },
    { date: "07/04", saldo: 12800 },
    { date: "11/04", saldo: 12350 },
    { date: "14/04", saldo: 13400 },
    { date: "17/04", saldo: 14200 },
  ],
  "90d": [
    { date: "Jan", saldo: 8500 },
    { date: "Fev", saldo: 9200 },
    { date: "Mar", saldo: 10800 },
    { date: "Abr", saldo: 14200 },
  ],
  "6m": [
    { date: "Nov", saldo: 6200 },
    { date: "Dez", saldo: 7800 },
    { date: "Jan", saldo: 8500 },
    { date: "Fev", saldo: 9200 },
    { date: "Mar", saldo: 10800 },
    { date: "Abr", saldo: 14200 },
  ],
}

type Period = "7d" | "30d" | "90d" | "6m"

const periodLabels: Record<Period, string> = {
  "7d": "7 dias",
  "30d": "30 dias",
  "90d": "90 dias",
  "6m": "6 meses",
}

interface AccountBalanceChartProps {
  accountId: string
}

export function AccountBalanceChart({ accountId }: AccountBalanceChartProps) {
  const [period, setPeriod] = useState<Period>("30d")

  const data = mockBalanceData[period]

  return (
    <div className="rounded-[24px] border-none bg-background dark:bg-sidebar p-6 shadow-[0_20px_40px_-5px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.2)] flex flex-col gap-4 relative overflow-hidden transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-base">Evolução do Saldo</h3>
          <p className="text-[14px] text-muted-foreground mt-0.5">Histórico de saldo ao longo do tempo</p>
        </div>

        {/* Period selector */}
        <div className="flex gap-1 bg-muted/60 rounded-xl p-1">
          {(Object.keys(periodLabels) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
                period === p
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      <ChartContainer config={chartConfig} className="min-h-[220px] max-h-[220px] w-full">
        <AreaChart accessibilityLayer data={data}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/30" />
          <XAxis dataKey="date" tickLine={false} tickMargin={8} axisLine={false} tick={{ fontSize: 13, fill: "currentColor" }} />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `R$${(v / 1000).toFixed(1)}k`}
            tick={{ fontSize: 13, fill: "currentColor" }}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) =>
                  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value))
                }
              />
            }
          />
          <defs>
            <linearGradient id="fillSaldo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-saldo)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-saldo)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <Area
            dataKey="saldo"
            type="monotone"
            fill="url(#fillSaldo)"
            stroke="var(--color-saldo)"
            strokeWidth={2}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}
