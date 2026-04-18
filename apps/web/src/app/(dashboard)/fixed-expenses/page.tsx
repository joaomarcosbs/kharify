"use client"

import { BillsPageBase } from "@/components/dashboard/bills-page-base"
import { ArrowUpRight } from "lucide-react"

export default function FixedExpensesPage() {
  return (
    <BillsPageBase
      type="pagar"
      title="Saídas Fixas"
      description="Obrigações recorrentes e pagamentos agendados."
      icon={ArrowUpRight}
      summaryLabel="Total a Pagar"
      summaryColor="text-red-400"
      summaryBg="bg-red-500/5"
      summaryBorder="border-red-500/10"
      buttonLabel="Nova Saída Fixa"
    />
  )
}
