"use client"

import { BillsPageBase } from "@/components/dashboard/bills-page-base"
import { ArrowDownLeft } from "lucide-react"

export default function FixedIncomePage() {
  return (
    <BillsPageBase
      type="receber"
      title="Entradas Fixas"
      description="Receitas recorrentes e recebíveis agendados."
      icon={ArrowDownLeft}
      summaryLabel="Total a Receber"
      summaryColor="text-emerald-500"
      summaryBg="bg-emerald-500/5"
      summaryBorder="border-emerald-500/10"
      buttonLabel="Nova Entrada Fixa"
    />
  )
}
