"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"

const chartData = [
  { week: "Sem 1", entradas: 3500, saidas: 2230 },
  { week: "Sem 2", entradas: 3150, saidas: 1822 },
  { week: "Sem 3", entradas: 850, saidas: 1274 },
  { week: "Sem 4", entradas: 3330, saidas: 2267 },
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

export function CashflowChart() {
  return (
    <div className="rounded-[32px] border-none bg-background dark:bg-sidebar p-8 shadow-[0_20px_40px_-5px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.2)] md:col-span-2 relative overflow-hidden flex flex-col gap-6 transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-xl">Fluxo de Caixa</h3>
          <p className="text-sm text-muted-foreground mt-1">Entradas vs Saídas — Abril 2026</p>
        </div>
      </div>
      <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
        <BarChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/30" />
          <XAxis
            dataKey="week"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            className="text-xs"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `R$${(v / 1000).toFixed(1)}k`}
            className="text-xs"
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
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="entradas" fill="var(--color-entradas)" radius={[8, 8, 0, 0]} />
          <Bar dataKey="saidas" fill="var(--color-saidas)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </div>
  )
}
