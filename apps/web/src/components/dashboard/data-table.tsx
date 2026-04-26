"use client"

import * as React from "react"
import {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  emptyMessage?: string
  searchKey?: string
  searchPlaceholder?: string
}

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function DataTable<TData, TValue>({
  columns,
  data,
  emptyMessage = "Nenhum dado encontrado",
  searchKey,
  searchPlaceholder = "Filtrar...",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  const hasRows = table.getFilteredRowModel().rows.length > 0

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Search / Filter bar */}
      {searchKey && (
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
            onChange={(e) => table.getColumn(searchKey)?.setFilterValue(e.target.value)}
            className="h-10 w-full max-w-sm rounded-xl border border-border/50 bg-muted/40 px-4 text-sm placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-border/50 bg-background dark:bg-sidebar shadow-[0_20px_40px_-5px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.2)] overflow-hidden transition-all duration-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-border/50">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground ${
                        header.column.getCanSort() ? "cursor-pointer select-none hover:text-foreground transition-colors" : ""
                      }`}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1.5">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <ArrowUpDown className={`size-3 transition-opacity ${
                            header.column.getIsSorted() ? "opacity-100" : "opacity-30"
                          }`} />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border/30">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-6 py-4 text-sm whitespace-nowrap"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-muted-foreground">
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {hasRows && (
        <div className="flex items-center justify-between px-2 flex-wrap gap-4">
          <div className="flex-1 text-xs text-muted-foreground">
            Mostrando {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}–
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{" "}
            de {table.getFilteredRowModel().rows.length} registros
          </div>

          <div className="flex items-center gap-6 lg:gap-8">
            <div className="flex items-center gap-2">
              <p className="text-xs font-medium text-muted-foreground">Linhas por página</p>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex min-w-[80px] items-center justify-center text-xs font-medium text-muted-foreground">
              Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                className="hidden size-8 p-0 sm:flex lg:flex rounded-lg"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Primeira página</span>
                <ChevronsLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                className="size-8 p-0 rounded-lg"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Página anterior</span>
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                className="size-8 p-0 rounded-lg"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Próxima página</span>
                <ChevronRight className="size-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 p-0 sm:flex lg:flex rounded-lg"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Última página</span>
                <ChevronsRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
