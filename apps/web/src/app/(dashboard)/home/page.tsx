"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import { CashflowChart } from "@/components/dashboard/cashflow-chart"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { ExpensesByGroupChart } from "@/components/dashboard/expenses-group-chart"
import { BalanceHistoryChart } from "@/components/dashboard/balance-history-chart"
import { formatCurrency } from "@/lib/format"
import { transactionsService } from "@/services/transactions.service"
import { debtsService } from "@/services/debts.service"
import { billsService } from "@/services/bills.service"
import { accountsService } from "@/services/accounts.service"
import { TrendingUp, TrendingDown, AlertTriangle, Wallet } from "lucide-react"

export default function DashboardOverviewPage() {
  const [income, setIncome] = useState(0)
  const [expenses, setExpenses] = useState(0)
  const [totalDebt, setTotalDebt] = useState(0)
  const [upcomingBills, setUpcomingBills] = useState(0)
  const [totalBalance, setTotalBalance] = useState(0)

  useEffect(() => {
    async function loadKPIs() {
      const [inc, exp, debt, upcoming, balance] = await Promise.all([
        transactionsService.getMonthlyIncome(),
        transactionsService.getMonthlyExpenses(),
        debtsService.getTotalDebt(),
        billsService.getUpcoming(7),
        accountsService.getTotalBalance(),
      ])
      setIncome(inc)
      setExpenses(exp)
      setTotalDebt(debt)
      setUpcomingBills(upcoming.length)
      setTotalBalance(balance)
    }
    loadKPIs()
  }, [])

  const balance = income - expenses
  const balanceTrend = balance >= 0 ? "up" : "down"

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8">
      <PageHeader
        title="Visão Geral"
        description="O desempenho geral dos seus painéis de gestão este mês."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Saldo Total"
          value={formatCurrency(totalBalance)}
          trend="Todas as contas"
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
          trend="Nos próximos 7 dias"
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
