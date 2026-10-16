"use client"

import { useEffect, useState, useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { PageHeader } from "@/components/page-header"
import { DataTable } from "@/components/dashboard/data-table"
import type { Bill, Category } from "@/types/entities"
import type { BillType } from "@/types/enums"
import { billsService } from "@/services/bills.service"
import { categoriesService } from "@/services/categories.service"
import { formatDate } from "@/lib/format"
import { useFormat } from "@/hooks/use-format"
import { BILL_STATUSES, BILL_RECURRENCES } from "@/types/enums"
import { ArrowDownLeft, ArrowUpRight } from "lucide-react"
import { BillFormSheet } from "@/components/forms/bill-form-sheet"
import { CategoryDonutChart } from "@/components/dashboard/category-donut-chart"
import { RowActions } from "@/components/dashboard/row-actions"

const statusConfig = {
  aberta: { color: "text-blue-400", bg: "bg-blue-400/10" },
  parcial: { color: "text-amber-400", bg: "bg-amber-400/10" },
  paga: { color: "text-emerald-500", bg: "bg-emerald-500/10" },
  atrasada: { color: "text-red-400", bg: "bg-red-400/10" },
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
  const [editingBill, setEditingBill] = useState<Bill | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const { formatCurrency } = useFormat()

  const reloadBills = async () => {
    const all = await billsService.findAll()
    setBills(all.filter((b) => b.type === type))
  }

  useEffect(() => {
    reloadBills()
    categoriesService.findAll().then(setCategories)
  }, [type])

  const getCategoryName = (id?: string | null) => {
    if (!id) return "—"
    return categories.find((c) => c.id === id)?.name ?? "—"
  }

  const totalPending = bills.filter((b) => b.status !== "paga").reduce((s, b) => s + b.amount, 0)

  const categoryData = useMemo(() => {
    const grouped = bills.reduce((acc, b) => {
      const catName = getCategoryName(b.categoryId)
      acc[catName] = (acc[catName] || 0) + b.amount
      return acc
    }, {} as Record<string, number>)

    return Object.entries(grouped).map(([name, value]) => ({ name, value }))
  }, [bills, categories])

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
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[13px] font-medium ${statusConfig[s].bg} ${statusConfig[s].color}`}>
            {BILL_STATUSES[s]}
          </span>
        )
      },
    },
    {
      accessorKey: "recurrence",
      header: "Recorrência",
      cell: ({ row }) => <span className="text-muted-foreground">{BILL_RECURRENCES[row.original.recurrence]}</span>,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const b = row.original
        return (
          <RowActions
            deleteConfirmMessage={`Tem certeza que deseja excluir "${b.description || "esta conta"}"?`}
            onEdit={() => setEditingBill(b)}
            onDelete={async () => {
              await billsService.remove(b.id)
              reloadBills()
            }}
          />
        )
      },
    },
  ], [formatCurrency, type, categories])

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8">
      <PageHeader
        title={title}
        description={description}
        actions={<BillFormSheet type={type} buttonLabel={buttonLabel} onBillSaved={reloadBills} />}
      />

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className={`rounded-[24px] ${summaryBg} border ${summaryBorder} p-6 transition-all duration-200 flex flex-col justify-center`}>
          <div className="flex items-center gap-2 mb-2">
            <Icon className={`size-4 ${summaryColor}`} />
            <p className={`text-sm font-semibold ${summaryColor}`}>{summaryLabel}</p>
          </div>
          <p className={`text-4xl font-semibold tracking-tighter ${summaryColor}`}>{formatCurrency(totalPending)}</p>
          <p className="text-xs text-muted-foreground mt-2">{bills.filter((b) => b.status !== "paga").length} pendente(s)</p>
        </div>

        <div className="rounded-[24px] bg-background dark:bg-sidebar p-6 shadow-[0_20px_40px_-5px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.2)] md:col-span-1 lg:col-span-2">
          <h3 className="font-semibold text-sm mb-4">Composição por Categoria</h3>
          <CategoryDonutChart data={categoryData} />
        </div>
      </div>

      {/* Tabela */}
      <DataTable
        columns={columns}
        data={bills}
        emptyMessage="Nenhum registro encontrado"
        searchKey="description"
        searchPlaceholder="Buscar por descrição..."
      />

      <BillFormSheet
        type={type}
        initialData={editingBill}
        open={!!editingBill}
        onOpenChange={(open) => !open && setEditingBill(null)}
        onBillSaved={reloadBills}
      />
    </div>
  )
}
