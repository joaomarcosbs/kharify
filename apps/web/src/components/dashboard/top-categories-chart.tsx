"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { transactionsService } from "@/services/transactions.service"
import { categoriesService } from "@/services/categories.service"
import type { Transaction, Category } from "@/types/entities"

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
  const [data, setData] = useState<{ name: string; amount: number; fill: string }[]>([])

  useEffect(() => {
    Promise.all([
      transactionsService.findAll().catch(() => [] as Transaction[]),
      categoriesService.findAll().catch(() => [] as Category[]),
    ]).then(([transactions, categories]) => {
      const categorySpend = transactions
        .filter((t) => t.type === "saida" && t.categoryId)
        .reduce((acc, t) => {
          const cat = categories.find((c) => c.id === t.categoryId)
          if (cat) {
            acc[cat.name] = (acc[cat.name] || 0) + Number(t.amount)
          }
          return acc
        }, {} as Record<string, number>)

      const computed = Object.entries(categorySpend)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, amount], i) => ({
          name,
          amount,
          fill: colors[i],
        }))

      setData(computed)
    })
  }, [])

  return (
    <div className="rounded-[24px] border-none bg-background dark:bg-sidebar p-6 shadow-[0_20px_40px_-5px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.2)] flex flex-col items-center justify-center gap-4 relative overflow-hidden transition-all duration-200 h-full w-full">
      <div className="w-full text-left shrink-0">
        <h3 className="font-semibold text-base">Top 5 Categorias</h3>
        <p className="text-[14px] text-muted-foreground mt-0.5">Maiores despesas do mês</p>
      </div>

      <ChartContainer config={chartConfig} className="w-full h-full min-h-[220px] max-h-[300px]">
        <BarChart
          accessibilityLayer
          data={data}
          layout="vertical"
          margin={{ left: 10, right: 10 }}
        >
          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `R$${v}`}
            tick={{ fontSize: 13, fill: "currentColor" }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tickLine={false}
            axisLine={false}
            width={120}
            tick={{ fontSize: 14, fill: "currentColor" }}
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
