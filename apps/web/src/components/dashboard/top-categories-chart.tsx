"use client"

import { Bar, BarChart, XAxis, YAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { mockTransactions } from "@/mocks/transactions"
import { mockCategories } from "@/mocks/categories"

const colors = [
  "oklch(0.65 0.2 25)",
  "oklch(0.75 0.18 65)",
  "oklch(0.70 0.15 280)",
  "oklch(0.72 0.17 152)",
  "oklch(0.68 0.16 200)",
]

const chartConfig = {
  amount: {
    label: "Valor",
    color: "oklch(0.65 0.2 25)",
  },
} satisfies ChartConfig

export function TopCategoriesChart() {
  // Calculate top 5 categories by expense amount
  const categorySpend = mockTransactions
    .filter((t) => t.type === "saida" && t.categoryId)
    .reduce(
      (acc, t) => {
        const cat = mockCategories.find((c) => c.id === t.categoryId)
        if (cat) {
          acc[cat.name] = (acc[cat.name] || 0) + t.amount
        }
        return acc
      },
      {} as Record<string, number>
    )

  const data = Object.entries(categorySpend)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, amount], i) => ({
      name,
      amount,
      fill: colors[i],
    }))

  return (
    <div className="rounded-[32px] border-none bg-background dark:bg-sidebar p-8 shadow-[0_20px_40px_-5px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.2)] flex flex-col gap-6 relative overflow-hidden transition-all duration-200">
      <div>
        <h3 className="font-semibold text-xl">Top 5 Categorias</h3>
        <p className="text-sm text-muted-foreground mt-1">Maiores despesas do mês</p>
      </div>

      <ChartContainer config={chartConfig} className="min-h-[260px] w-full">
        <BarChart
          accessibilityLayer
          data={data}
          layout="vertical"
          margin={{ left: 10 }}
        >
          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `R$${v}`}
            className="text-xs"
          />
          <YAxis
            type="category"
            dataKey="name"
            tickLine={false}
            axisLine={false}
            width={100}
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
          <Bar dataKey="amount" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ChartContainer>
    </div>
  )
}
