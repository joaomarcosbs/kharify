"use client"

import { Pie, PieChart, Cell } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useFormat } from "@/hooks/use-format"

const colors = [
  "oklch(0.65 0.2 25)",
  "oklch(0.75 0.18 65)",
  "oklch(0.70 0.15 280)",
  "oklch(0.72 0.17 152)",
  "oklch(0.68 0.16 200)",
]

interface CategoryDonutChartProps {
  data: { name: string; value: number }[]
}

export function CategoryDonutChart({ data }: CategoryDonutChartProps) {
  const { formatCurrency } = useFormat()
  const chartData = data
    .sort((a, b) => b.value - a.value)
    .slice(0, 5) // top 5
    .map((item, index) => ({
      ...item,
      fill: colors[index % colors.length],
    }))

  const total = chartData.reduce((sum, d) => sum + d.value, 0)

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-[180px] w-full text-sm text-muted-foreground">
        Sem dados para exibir
      </div>
    )
  }

  const chartConfig = chartData.reduce((acc, curr, i) => {
    acc[`cat${i}`] = { label: curr.name, color: curr.fill }
    return acc
  }, {} as Record<string, { label: string; color: string }>)

  return (
    <div className="flex justify-between items-center w-full gap-6">
      <ChartContainer config={chartConfig} className="min-h-[140px] max-h-[140px] w-[140px] shrink-0">
        <PieChart>
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => formatCurrency(Number(value))}
              />
            }
          />
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={45}
            outerRadius={70}
            strokeWidth={2}
            stroke="transparent"
            paddingAngle={3}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>

      {/* Legend */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-6 gap-y-3 flex-1 px-2">
        {chartData.map((entry, i) => (
          <div key={entry.name} className="flex justify-between items-center gap-2 w-full">
            <div className="flex items-center gap-2 truncate">
              <div
                className="size-3 rounded-full shrink-0"
                style={{ backgroundColor: entry.fill }}
              />
              <span className="text-[13px] font-medium truncate">{entry.name}</span>
            </div>
            <div className="flex items-center gap-1.5 text-right shrink-0">
              <span className="text-[12px] text-muted-foreground tabular-nums">
                {((entry.value / total) * 100).toFixed(0)}%
              </span>
              <span className="text-[13px] font-medium tabular-nums">
                · {formatCurrency(entry.value)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
