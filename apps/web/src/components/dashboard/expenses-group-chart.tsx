"use client"

import { useEffect, useState } from "react"
import { Pie, PieChart, Cell } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useFormat } from "@/hooks/use-format"
import { dashboardService } from "@/services/dashboard.service"

const chartConfig = {
  essencial: { label: "Essencial", color: "oklch(0.65 0.2 25)" },
  necessario: { label: "Necessário", color: "oklch(0.75 0.18 65)" },
  superfluo: { label: "Supérfluo", color: "oklch(0.70 0.15 280)" },
} satisfies ChartConfig

export function ExpensesByGroupChart() {
  const { formatCurrency } = useFormat()

  const [data, setData] = useState([
    { name: "Essencial", value: 0, fill: "var(--color-essencial)" },
    { name: "Necessário", value: 0, fill: "var(--color-necessario)" },
    { name: "Supérfluo", value: 0, fill: "var(--color-superfluo)" },
  ])

  useEffect(() => {
    dashboardService.getCategoryBreakdown().then((breakdown) => {
      if (breakdown && breakdown.length > 0) {
        const grouped: Record<string, number> = { essencial: 0, necessario: 0, superfluo: 0 }
        for (const item of breakdown) {
          const grp = (item.groupType || "essencial").toLowerCase()
          grouped[grp] = (grouped[grp] || 0) + Number(item.amount)
        }
        setData([
          { name: "Essencial", value: grouped["essencial"] || 0, fill: "var(--color-essencial)" },
          { name: "Necessário", value: grouped["necessario"] || 0, fill: "var(--color-necessario)" },
          { name: "Supérfluo", value: grouped["superfluo"] || 0, fill: "var(--color-superfluo)" },
        ])
      }
    })
  }, [])

  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className="rounded-[24px] border-none bg-background dark:bg-sidebar p-6 shadow-[0_20px_40px_-5px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.2)] flex flex-col gap-4 relative overflow-hidden transition-all duration-200">
      <div>
        <h3 className="font-semibold text-base">Despesas por Grupo</h3>
        <p className="text-[14px] text-muted-foreground mt-0.5">Distribuição mensal</p>
      </div>

      <ChartContainer config={chartConfig} className="mx-auto w-full min-h-[180px] max-h-[180px]">
        <PieChart>
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => formatCurrency(Number(value))}
              />
            }
          />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={50}
            outerRadius={80}
            strokeWidth={3}
            stroke="transparent"
            paddingAngle={3}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>

      {/* Legend */}
      <div className="flex justify-center flex-wrap gap-x-8 gap-y-4 px-2 mt-2">
        {data.map((entry, i) => (
          <div key={entry.name} className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-2">
              <div
                className="size-3 rounded-full shrink-0"
                style={{ backgroundColor: Object.values(chartConfig)[i].color }}
              />
              <span className="text-[14px] font-medium leading-none">{entry.name}</span>
            </div>
            <div className="flex items-center gap-2 pl-5">
              <span className="text-[13px] text-muted-foreground">
                {total > 0 ? ((entry.value / total) * 100).toFixed(0) : 0}%
              </span>
              <span className="text-[13px] text-muted-foreground tabular-nums">
                · {formatCurrency(entry.value)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
