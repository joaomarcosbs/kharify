"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/page-header"
import type { Debt, SimulationResult } from "@/types/entities"
import type { SimulationType } from "@/types/enums"
import { debtsService } from "@/services/debts.service"
import { formatPercent } from "@/lib/format"
import { useFormat } from "@/hooks/use-format"
import { DEBT_STATUSES, SIMULATION_TYPES } from "@/types/enums"
import { DataTable } from "@/components/dashboard/data-table"
import { DebtSimulationChart } from "@/components/dashboard/debt-simulation-chart"
import { Button } from "@/components/ui/button"
import { TrendingDown, Calculator, ChevronDown, ChevronUp } from "lucide-react"
import { DebtFormSheet } from "@/components/forms/debt-form-sheet"
import { mockSimulationPrice, mockSimulationSAC } from "@/mocks/debts"
import { CategoryDonutChart } from "@/components/dashboard/category-donut-chart"
import { Input } from "@/components/ui/input"

export default function DividasPage() {
  const [debts, setDebts] = useState<Debt[]>([])
  const [totalDebt, setTotalDebt] = useState(0)
  const [activeSimulation, setActiveSimulation] = useState<string | null>(null)
  const [simulationType, setSimulationType] = useState<SimulationType>("price")
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null)
  const [showFullTable, setShowFullTable] = useState(false)
  const [extraPayment, setExtraPayment] = useState<string>("500")
  const { formatCurrency } = useFormat()

  useEffect(() => {
    async function load() {
      const [allDebts, total] = await Promise.all([
        debtsService.findAll(),
        debtsService.getTotalDebt(),
      ])
      setDebts(allDebts)
      setTotalDebt(total)
    }
    load()
  }, [])

  useEffect(() => {
    if (activeSimulation) {
      const handler = setTimeout(() => {
        const amount = Number(extraPayment)
        if (!isNaN(amount) && amount >= 0) {
          debtsService.simulate(activeSimulation, {
            simulationType,
            simulationMode: "extraPayment",
            extraPaymentAmount: amount,
          }).then(setSimulationResult)
        }
      }, 500)
      return () => clearTimeout(handler)
    } else {
      setSimulationResult(null)
    }
  }, [activeSimulation, simulationType, extraPayment])

  function handleSimulate(debtId: string) {
    if (activeSimulation === debtId) {
      setActiveSimulation(null)
    } else {
      setSimulationResult(null)
      setActiveSimulation(debtId)
    }
  }

  function handleToggleType(type: SimulationType) {
    setSimulationType(type)
  }

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8">
      <PageHeader
        title="Dívidas"
        description="Acompanhe suas dívidas e simule estratégias de quitação."
        actions={<DebtFormSheet />}
      />

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="rounded-[24px] bg-red-400/10 border border-red-500/10 p-6 transition-all duration-200 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="size-4 text-red-500 dark:text-red-400" />
            <p className="text-sm font-semibold text-red-500 dark:text-red-400">Total Devido</p>
          </div>
          <p className="text-4xl font-semibold tracking-tighter text-red-500 dark:text-red-400">{formatCurrency(totalDebt)}</p>
          <p className="text-[13px] text-muted-foreground mt-2">{debts.filter((d) => d.status === "ativa").length} dívida(s) ativa(s)</p>
        </div>

        <div className="rounded-[24px] bg-background dark:bg-sidebar p-6 shadow-[0_20px_40px_-5px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.2)] md:col-span-1 lg:col-span-2">
          <h3 className="font-semibold text-sm mb-4">Composição por Dívida</h3>
          <CategoryDonutChart data={debts.filter(d => d.status === "ativa").map(d => ({ name: d.name, value: d.currentBalance }))} />
        </div>
      </div>

      {/* Cards de dívidas */}
      <div className="flex flex-col gap-6">
        {debts.map((debt) => {
          const progress = ((debt.originalAmount - debt.currentBalance) / debt.originalAmount) * 100
          const isSimulating = activeSimulation === debt.id

          return (
            <div key={debt.id} className="flex flex-col">
              <div className="rounded-[24px] border-none bg-background dark:bg-sidebar p-8 shadow-[0_20px_40px_-5px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.2)] transition-all duration-200">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-xl font-semibold">{debt.name}</h3>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${debt.status === "ativa" ? "bg-amber-400/10 text-amber-400" : "bg-emerald-500/10 text-emerald-500"
                        }`}>
                        {DEBT_STATUSES[debt.status]}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-2">
                      <div>
                        <p className="text-muted-foreground text-[14px] mb-1">Valor original</p>
                        <p className="font-medium text-base">{formatCurrency(debt.originalAmount)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-[14px] mb-1">Saldo devedor</p>
                        <p className="font-medium text-base text-red-400">{formatCurrency(debt.currentBalance)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-[14px] mb-1">Juros mensal</p>
                        <p className="font-medium text-base">{debt.interestRateMonth ? formatPercent(debt.interestRateMonth) : "—"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-[14px] mb-1">Parcela</p>
                        <p className="font-medium text-base">{debt.installmentAmount ? formatCurrency(debt.installmentAmount) : "—"}</p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-8">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[14px] text-muted-foreground">Progresso de quitação</span>
                        <span className="text-[14px] font-medium">{progress.toFixed(1)}%</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-muted/50 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-linear-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Botão simular */}
                  <div className="flex md:flex-col gap-2 shrink-0">
                    <Button
                      variant={isSimulating ? "default" : "outline"}
                      className="rounded-xl gap-2"
                      onClick={() => handleSimulate(debt.id)}
                    >
                      <Calculator className="size-4" />
                      {isSimulating ? "Fechar" : "Simular"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Simulador inline */}
              {isSimulating && (
                <div className="mx-4 rounded-b-[24px] bg-muted/30 dark:bg-sidebar/50 border border-t-0 border-border/30 p-8 transition-all duration-300 animate-in slide-in-from-top-2 relative overflow-hidden">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
                    <div>
                      <h4 className="font-semibold text-lg flex items-center gap-2 mb-3">
                        <Calculator className="size-4 text-primary" />
                        Simulador de Quitação
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">Parcela extra de R$</span>
                        <Input
                           type="number"
                           className="h-8 w-24 px-2 py-1 text-sm bg-background"
                           value={extraPayment}
                           onChange={(e) => setExtraPayment(e.target.value)}
                           min="0"
                           step="100"
                        />
                        <span className="text-sm text-muted-foreground whitespace-nowrap">/mês</span>
                      </div>
                    </div>

                    {/* Toggle Price / SAC */}
                    <div className="flex gap-1 bg-muted/60 rounded-xl p-1 shrink-0">
                      {(["price", "sac"] as SimulationType[]).map((type) => (
                        <button
                          key={type}
                          onClick={() => handleToggleType(type)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${simulationType === type
                              ? "bg-foreground text-background shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                          {SIMULATION_TYPES[type]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {!simulationResult ? (
                    <div className="flex justify-center items-center py-12">
                       <p className="text-sm text-muted-foreground animate-pulse">Calculando simulação...</p>
                    </div>
                  ) : (
                    <div className="relative z-10 animate-in fade-in duration-300">
                      {/* Resumo da simulação */}
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="rounded-xl bg-background/60 dark:bg-sidebar/60 p-4 border border-border/20">
                          <p className="text-xs text-muted-foreground mb-1">Meses até quitar</p>
                          <p className="text-2xl font-semibold tracking-tight">{simulationResult.months}</p>
                        </div>
                        <div className="rounded-xl bg-background/60 dark:bg-sidebar/60 p-4 border border-border/20">
                          <p className="text-xs text-muted-foreground mb-1">Total pago</p>
                          <p className="text-2xl font-semibold tracking-tight">{formatCurrency(simulationResult.totalPaid)}</p>
                        </div>
                        <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-4">
                          <p className="text-xs text-emerald-500 mb-1">Total de juros</p>
                          <p className="text-2xl font-semibold tracking-tight text-emerald-500">{formatCurrency(simulationResult.totalInterest)}</p>
                        </div>
                      </div>

                      {/* Gráfico Price vs SAC */}
                      <DebtSimulationChart priceData={mockSimulationPrice} sacData={mockSimulationSAC} />

                      {/* Tabela de amortização */}
                      <div className="flex items-center justify-between mb-4 mt-6">
                        <h5 className="text-sm font-semibold">Tabela de Amortização</h5>
                        <button
                          onClick={() => setShowFullTable(!showFullTable)}
                          className="text-xs text-primary flex items-center gap-1 hover:underline"
                        >
                          {showFullTable ? "Recolher" : "Expandir"}
                          {showFullTable ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                        </button>
                      </div>

                      <DataTable
                        data={showFullTable ? simulationResult.rows : simulationResult.rows.slice(0, 6)}
                        columns={[
                          {
                            accessorKey: "monthIndex",
                            header: "Mês",
                            cell: ({ row }) => <span className="font-medium">{row.original.monthIndex}</span>,
                          },
                          {
                            accessorKey: "paymentAmount",
                            header: "Parcela",
                            cell: ({ row }) => <span className="tabular-nums">{formatCurrency(row.original.paymentAmount)}</span>,
                          },
                          {
                            accessorKey: "interestPaid",
                            header: "Juros",
                            cell: ({ row }) => <span className="text-red-400 tabular-nums">{formatCurrency(row.original.interestPaid)}</span>,
                          },
                          {
                            accessorKey: "principalPaid",
                            header: "Amortização",
                            cell: ({ row }) => <span className="text-emerald-500 tabular-nums">{formatCurrency(row.original.principalPaid)}</span>,
                          },
                          {
                            accessorKey: "remainingBalance",
                            header: "Saldo",
                            cell: ({ row }) => <span className="font-semibold tabular-nums">{formatCurrency(row.original.remainingBalance)}</span>,
                          },
                        ]}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
