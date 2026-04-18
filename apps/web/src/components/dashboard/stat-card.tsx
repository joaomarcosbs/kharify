import type { ReactNode } from "react"

interface StatCardProps {
  title: string
  value: string
  trend?: string
  trendDirection?: "up" | "down" | "neutral"
  icon?: ReactNode
}

export function StatCard({ title, value, trend, trendDirection = "up", icon }: StatCardProps) {
  const trendColor = {
    up: "text-emerald-500",
    down: "text-red-400",
    neutral: "text-muted-foreground",
  }[trendDirection]

  return (
    <div className="rounded-[24px] border-none bg-background dark:bg-sidebar p-8 shadow-[0_20px_40px_-5px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.2)] transition-all duration-200 hover:-translate-y-1 group relative overflow-hidden">
      <div className="flex items-center justify-between pb-4">
        <h3 className="font-semibold text-muted-foreground text-sm">{title}</h3>
        {icon && (
          <div className="flex items-center justify-center size-10 rounded-xl bg-primary/5 text-primary/70">
            {icon}
          </div>
        )}
      </div>
      <div className="text-3xl font-semibold tracking-tighter mb-3">{value}</div>
      {trend && (
        <p className={`text-xs font-medium ${trendColor}`}>{trend}</p>
      )}
    </div>
  )
}
