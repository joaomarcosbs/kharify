"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Tags } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { DataTable } from "@/components/dashboard/data-table"
import { RowActions } from "@/components/dashboard/row-actions"
import { CategoryFormSheet } from "@/components/forms/category-form-sheet"
import { categoriesService } from "@/services/categories.service"
import type { Category } from "@/types/entities"
import { CATEGORY_GROUP_TYPES, CATEGORY_KINDS } from "@/types/enums"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const load = useCallback(async () => {
    setCategories(await categoriesService.findAll())
  }, [])

  useEffect(() => {
    let cancelled = false
    categoriesService.findAll().then((items) => {
      if (!cancelled) setCategories(items)
    })
    return () => { cancelled = true }
  }, [])

  const columns = useMemo<ColumnDef<Category, unknown>[]>(() => [
    {
      accessorKey: "name",
      header: "Nome",
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: "kind",
      header: "Tipo",
      cell: ({ row }) => <span className="text-muted-foreground">{CATEGORY_KINDS[row.original.kind]}</span>,
    },
    {
      accessorKey: "groupType",
      header: "Grupo",
      cell: ({ row }) => <span className="text-muted-foreground">{CATEGORY_GROUP_TYPES[row.original.groupType]}</span>,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <RowActions
          onEdit={() => setEditingCategory(row.original)}
          deleteConfirmMessage={`Tem certeza que deseja excluir a categoria "${row.original.name}"?`}
          onDelete={async () => { await categoriesService.remove(row.original.id); await load() }}
        />
      ),
    },
  ], [load])

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8">
      <PageHeader
        title="Categorias"
        description="Crie e organize as categorias usadas em transações e contas fixas."
        actions={<CategoryFormSheet onCategorySaved={load} />}
      />

      <DataTable
        columns={columns}
        data={categories}
        emptyMessage="Nenhuma categoria cadastrada"
        searchKey="name"
        searchPlaceholder="Buscar categoria..."
      />

      {categories.length === 0 && (
        <div className="rounded-[24px] border border-dashed border-border/60 bg-background/50 p-12 text-center">
          <div className="mx-auto size-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground mb-4">
            <Tags className="size-6" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Crie sua primeira categoria</h3>
          <p className="text-sm text-muted-foreground">As categorias aparecerão nos formulários de transações e contas fixas.</p>
        </div>
      )}

      <CategoryFormSheet
        initialData={editingCategory}
        open={!!editingCategory}
        onOpenChange={(open) => !open && setEditingCategory(null)}
        onCategorySaved={load}
      />
    </div>
  )
}
