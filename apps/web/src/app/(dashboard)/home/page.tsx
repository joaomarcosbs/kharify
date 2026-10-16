"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import { CashflowChart } from "@/components/dashboard/cashflow-chart"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { ExpensesByGroupChart } from "@/components/dashboard/expenses-group-chart"
import { BalanceHistoryChart } from "@/components/dashboard/balance-history-chart"
import { useFormat } from "@/hooks/use-format"
import { dashboardService } from "@/services/dashboard.service"
import { TrendingUp, TrendingDown, AlertTriangle, Wallet, HeartPulse } from "lucide-react"

export default function DashboardOverviewPage() {
  const [income, setIncome] = useState(0)
  const [expenses, setExpenses] = useState(0)
  const [totalDebt, setTotalDebt] = useState(0)
  const [upcomingBills, setUpcomingBills] = useState(0)
  const [totalBalance, setTotalBalance] = useState(0)
  const [healthScore, setHealthScore] = useState<number | null>(null)
  const { formatCurrency } = useFormat()

  useEffect(() => {
    async function loadKPIs() {
      const summary = await dashboardService.getSummary()
      setTotalBalance(summary.totalBalance)
      setIncome(summary.monthlyIncome)
      setExpenses(summary.monthlyExpense)
      setTotalDebt(summary.totalDebtBalance)
      setUpcomingBills(summary.pendingBillsCount)
      setHealthScore(summary.healthScore)
    }
    loadKPIs()
  }, [])

  const balance = income - expenses
  const balanceTrend = balance >= 0 ? "up" : "down"

  const getScoreBadge = (score: number) => {
    if (score >= 80) {
      return {
        label: "Excelente",
        color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      }
    }
    if (score >= 60) {
      return {
        label: "Saudável",
        color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      }
    }
    return {
      label: "Atenção",
      color: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    }
  }

  const scoreBadge = healthScore != null ? getScoreBadge(healthScore) : null

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8">
      <PageHeader
        title="Visão Geral"
        description="O desempenho geral dos seus painéis de gestão este mês."
        actions={
          healthScore != null && scoreBadge ? (
            <div
              className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl border ${scoreBadge.color} backdrop-blur shadow-xs`}
            >
              <HeartPulse className="size-4 shrink-0" />
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-muted-foreground font-medium">Health Score:</span>
                <span className="font-bold">{healthScore}/100</span>
                <span className="opacity-80">({scoreBadge.label})</span>
              </div>
            </div>
          ) : undefined
        }
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Saldo Total"
          value={formatCurrency(totalBalance)}
          trend="Todas as contas ativas"
          trendDirection="neutral"
          icon={<Wallet className="size-5" />}
        />
        <StatCard
          title="Balanço do Mês"
          value={formatCurrency(balance)}
          trend={`${formatCurrency(income)} entradas · ${formatCurrency(expenses)} saídas`}
          trendDirection={balanceTrend}
          icon={balance >= 0 ? <TrendingUp className="size-5" /> : <TrendingDown className="size-5" />}
        />
        <StatCard
          title="Total Devido"
          value={formatCurrency(totalDebt)}
          trend="Dívidas ativas"
          trendDirection="down"
          icon={<TrendingDown className="size-5" />}
        />
        <StatCard
          title="Próximos Vencimentos"
          value={String(upcomingBills)}
          trend="Contas pendentes no mês"
          trendDirection={upcomingBills > 0 ? "down" : "up"}
          icon={<AlertTriangle className="size-5" />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <CashflowChart />
        <RecentActivity />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <BalanceHistoryChart />
        <ExpensesByGroupChart />
      </div>
    </div>
  )
}
