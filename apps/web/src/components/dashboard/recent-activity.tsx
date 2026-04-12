interface ActivityItem {
  id: string
  label: string
  initials: string
  timestamp: string
}

interface RecentActivityProps {
  items?: ActivityItem[]
}

const defaultItems: ActivityItem[] = [
  { id: "1", label: "Atualização financeira", initials: "A0", timestamp: "Há 2 horas" },
  { id: "2", label: "Atualização financeira", initials: "A1", timestamp: "Há 2 horas" },
  { id: "3", label: "Atualização financeira", initials: "A2", timestamp: "Há 2 horas" },
  { id: "4", label: "Atualização financeira", initials: "A3", timestamp: "Há 2 horas" },
]

export function RecentActivity({ items = defaultItems }: RecentActivityProps) {
  return (
    <div className="rounded-[32px] border-none bg-background dark:bg-sidebar p-8 shadow-[0_20px_40px_-5px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.2)] flex flex-col gap-6 relative overflow-hidden transition-all duration-200">
      <h3 className="font-semibold text-xl">Ações Recentes</h3>
      <div className="flex flex-col gap-6">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 items-center">
            <div className="h-12 w-12 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
              {item.initials}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold">{item.label}</span>
              <span className="text-xs text-muted-foreground">{item.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
