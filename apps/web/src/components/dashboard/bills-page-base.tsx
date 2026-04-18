"use client"

import { useEffect, useState, useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { PageHeader } from "@/components/page-header"
import { DataTable } from "@/components/dashboard/data-table"
import type { Bill } from "@/types/entities"
import type { BillType } from "@/types/enums"
import { billsService } from "@/services/bills.service"
import { formatCurrency, formatDate } from "@/lib/format"
import { BILL_STATUSES, BILL_RECURRENCES } from "@/types/enums"
import { mockCategories } from "@/mocks/categories"
import { ArrowDownLeft, ArrowUpRight } from "lucide-react"
import { BillFormSheet } from "@/components/forms/bill-form-sheet"

const statusConfig = {
  aberta: { color: "text-blue-400", bg: "bg-blue-400/10" },
  parcial: { color: "text-amber-400", bg: "bg-amber-400/10" },
  paga: { color: "text-emerald-500", bg: "bg-emerald-500/10" },
  atrasada: { color: "text-red-400", bg: "bg-red-400/10" },
}

const getCategoryName = (id?: string | null) => {
  if (!id) return "—"
  return mockCategories.find((c) => c.id === id)?.name ?? "—"
}

interface BillsPageBaseProps {
  type: BillType
  title: string
  description: string
  icon: typeof ArrowDownLeft
  summaryLabel: string
  summaryColor: string
  summaryBg: string
  summaryBorder: string
  buttonLabel: string
}

export function BillsPageBase({
  type,
  title,
  description,
  icon: Icon,
  summaryLabel,
  summaryColor,
  summaryBg,
  summaryBorder,
  buttonLabel,
}: BillsPageBaseProps) {
  const [bills, setBills] = useState<Bill[]>([])

  useEffect(() => {
    billsService.findAll().then((all) => {
      setBills(all.filter((b) => b.type === type))
    })
  }, [type])

  const totalPending = bills.filter((b) => b.status !== "paga").reduce((s, b) => s + b.amount, 0)

  const columns = useMemo<ColumnDef<Bill, unknown>[]>(() => [
    {
      accessorFn: (row) => row.description || "Sem descrição",
      id: "description",
      header: "Descrição",
      cell: ({ row }) => <span className="font-medium">{row.original.description || "Sem descrição"}</span>,
    },
    {
      accessorFn: (row) => getCategoryName(row.categoryId),
      id: "category",
      header: "Categoria",
      cell: ({ getValue }) => <span className="text-xs text-muted-foreground">{getValue() as string}</span>,
    },
    {
      accessorKey: "amount",
      header: "Valor",
      cell: ({ row }) => <span className="font-semibold tabular-nums">{formatCurrency(row.original.amount)}</span>,
    },
    {
      accessorKey: "dueDate",
      header: "Vencimento",
      cell: ({ row }) => <span className="text-muted-foreground">{formatDate(row.original.dueDate)}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const s = row.original.status
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${statusConfig[s].bg} ${statusConfig[s].color}`}>
            {BILL_STATUSES[s]}
          </span>
        )
      },
    },
    {
      accessorKey: "recurrence",
      header: "Recorrência",
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{BILL_RECURRENCES[row.original.recurrence]}</span>,
    },
  ], [])

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8">
      <PageHeader
        title={title}
        description={description}
        actions={<BillFormSheet type={type} buttonLabel={buttonLabel} />}
      />

      {/* Resumo */}
      <div className={`rounded-[24px] ${summaryBg} border ${summaryBorder} p-6 transition-all duration-200`}>
        <div className="flex items-center gap-2 mb-1">
          <Icon className={`size-4 ${summaryColor}`} />
          <p className={`text-sm font-semibold ${summaryColor}`}>{summaryLabel}</p>
        </div>
        <p className={`text-3xl font-semibold tracking-tighter ${summaryColor}`}>{formatCurrency(totalPending)}</p>
        <p className="text-xs text-muted-foreground mt-1">{bills.filter((b) => b.status !== "paga").length} pendente(s)</p>
      </div>

      {/* Tabela */}
      <DataTable
        columns={columns}
        data={bills}
        emptyMessage="Nenhum registro encontrado"
        searchKey="description"
        searchPlaceholder="Buscar por descrição..."
      />
    </div>
  )
}
