"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { month: "Nov", entradas: 8200, saidas: 5800 },
  { month: "Dez", entradas: 11500, saidas: 8900 },
  { month: "Jan", entradas: 7800, saidas: 6200 },
  { month: "Fev", entradas: 8950, saidas: 7100 },
  { month: "Mar", entradas: 9200, saidas: 6800 },
  { month: "Abr", entradas: 10830, saidas: 6013 },
]

const chartConfig = {
  entradas: {
    label: "Entradas",
    color: "oklch(0.72 0.17 152)",
  },
  saidas: {
    label: "Saídas",
    color: "oklch(0.65 0.2 25)",
  },
} satisfies ChartConfig

export function BalanceHistoryChart() {
  return (
    <div className="rounded-[24px] border-none bg-background dark:bg-sidebar p-6 shadow-[0_20px_40px_-5px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.2)] md:col-span-2 flex flex-col gap-4 relative overflow-hidden transition-all duration-200">
      <div>
        <h3 className="font-semibold text-base">Balanço — Últimos 6 Meses</h3>
        <p className="text-[14px] text-muted-foreground mt-0.5">Evolução de entradas e saídas</p>
      </div>

      <ChartContainer config={chartConfig} className="min-h-[220px] max-h-[220px] w-full">
        <AreaChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/30" />
          <XAxis dataKey="month" tickLine={false} tickMargin={8} axisLine={false} tick={{ fontSize: 13, fill: "currentColor" }} />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
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
            <linearGradient id="fillEntradas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-entradas)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-entradas)" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="fillSaidas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-saidas)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-saidas)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <Area
            dataKey="entradas"
            type="monotone"
            fill="url(#fillEntradas)"
            stroke="var(--color-entradas)"
            strokeWidth={2}
          />
          <Area
            dataKey="saidas"
            type="monotone"
            fill="url(#fillSaidas)"
            stroke="var(--color-saidas)"
            strokeWidth={2}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}
