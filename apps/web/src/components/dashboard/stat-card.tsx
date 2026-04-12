interface StatCardProps {
  title: string
  value: string
  trend?: string
  trendDirection?: "up" | "down" | "neutral"
}

export function StatCard({ title, value, trend, trendDirection = "up" }: StatCardProps) {
  const trendColor = {
    up: "text-green-500",
    down: "text-red-500",
    neutral: "text-muted-foreground",
  }[trendDirection]

  return (
    <div className="rounded-[24px] border-none bg-background dark:bg-sidebar p-8 shadow-[0_20px_40px_-5px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.2)] transition-all duration-200 hover:-translate-y-1 group relative overflow-hidden">
      <h3 className="font-semibold text-muted-foreground pb-4 text-sm">{title}</h3>
      <div className="text-5xl font-semibold tracking-tighter mb-3">{value}</div>
      {trend && (
        <p className={`text-sm font-medium ${trendColor}`}>{trend}</p>
      )}
    </div>
  )
}
