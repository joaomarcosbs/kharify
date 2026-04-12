import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import { CashflowChart } from "@/components/dashboard/cashflow-chart"
import { RecentActivity } from "@/components/dashboard/recent-activity"

export default function DashboardOverviewPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8">
      <PageHeader
        title="Visão Geral"
        description="O desempenho geral dos seus painéis de gestão hoje."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Visão Geral" },
        ]}
      />

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard title="Métrica Chave 1" value="R$ 14.529" trend="+20.1% na semana" trendDirection="up" />
        <StatCard title="Métrica Chave 2" value="R$ 14.529" trend="+20.1% na semana" trendDirection="up" />
        <StatCard title="Métrica Chave 3" value="R$ 14.529" trend="+20.1% na semana" trendDirection="up" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <CashflowChart />
        <RecentActivity />
      </div>
    </div>
  )
}
