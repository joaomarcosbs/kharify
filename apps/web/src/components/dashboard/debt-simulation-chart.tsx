"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import type { SimulationResult } from "@/types/entities"

const chartConfig = {
  price: {
    label: "Tabela Price",
    color: "oklch(0.72 0.17 152)",
  },
  sac: {
    label: "SAC",
    color: "oklch(0.75 0.18 65)",
  },
} satisfies ChartConfig

interface DebtSimulationChartProps {
  priceData: SimulationResult
  sacData: SimulationResult
}

export function DebtSimulationChart({ priceData, sacData }: DebtSimulationChartProps) {
  // Combine both into a single dataset
  const maxMonths = Math.max(priceData.rows.length, sacData.rows.length)
  const data = Array.from({ length: maxMonths }, (_, i) => ({
    month: i + 1,
    price: priceData.rows[i]?.remainingBalance ?? 0,
    sac: sacData.rows[i]?.remainingBalance ?? 0,
  }))

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h5 className="font-semibold text-sm">Price vs SAC — Evolução do Saldo</h5>
        <p className="text-xs text-muted-foreground mt-0.5">Comparação entre os dois sistemas de amortização</p>
      </div>

      <ChartContainer config={chartConfig} className="min-h-[200px] max-h-[200px] w-full">
        <LineChart accessibilityLayer data={data}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/30" />
          <XAxis
            dataKey="month"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            className="text-xs"
            label={{ value: "Meses", position: "insideBottom", offset: -5, className: "text-xs fill-muted-foreground" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
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
          <Line
            type="monotone"
            dataKey="price"
            stroke="var(--color-price)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="sac"
            stroke="var(--color-sac)"
            strokeWidth={2}
            dot={false}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ChartContainer>
    </div>
  )
}
