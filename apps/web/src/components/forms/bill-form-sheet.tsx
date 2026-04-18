"use client"

import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BILL_RECURRENCES } from "@/types/enums"
import type { BillType, BillRecurrence } from "@/types/enums"
import { mockCategories } from "@/mocks/categories"
import { Plus, Save } from "lucide-react"

interface BillFormSheetProps {
  type: BillType
  buttonLabel: string
  onSubmit?: (data: {
    type: BillType
    amount: number
    dueDate: string
    categoryId?: string
    recurrence: BillRecurrence
    description?: string
  }) => void
}

export function BillFormSheet({ type, buttonLabel, onSubmit }: BillFormSheetProps) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    amount: "",
    dueDate: "",
    categoryId: "",
    recurrence: "mensal" as BillRecurrence,
    description: "",
  })

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.({
      type,
      amount: Number(form.amount),
      dueDate: form.dueDate,
      categoryId: form.categoryId || undefined,
      recurrence: form.recurrence,
      description: form.description || undefined,
    })
    setForm({ amount: "", dueDate: "", categoryId: "", recurrence: "mensal", description: "" })
    setOpen(false)
  }

  const isIncome = type === "receber"

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button className="rounded-xl gap-2" />}>
          <Plus className="size-4" />
          {buttonLabel}
      </SheetTrigger>
      <SheetContent className="sm:max-w-[440px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isIncome ? "Nova Entrada Fixa" : "Nova Saída Fixa"}</SheetTitle>
          <SheetDescription>
            {isIncome
              ? "Cadastre uma receita recorrente ou recebível agendado."
              : "Cadastre uma obrigação recorrente ou pagamento agendado."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="bill-desc">Descrição *</Label>
            <Input
              id="bill-desc"
              placeholder={isIncome ? "Ex: Aluguel recebido, Freelance" : "Ex: Aluguel, Internet, Luz"}
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="bill-amount">Valor (R$) *</Label>
            <Input
              id="bill-amount"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={form.amount}
              onChange={(e) => handleChange("amount", e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="bill-due">Data de vencimento *</Label>
            <Input
              id="bill-due"
              type="date"
              value={form.dueDate}
              onChange={(e) => handleChange("dueDate", e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="bill-category">Categoria</Label>
            <Select value={form.categoryId} onValueChange={(v) => v && handleChange("categoryId", v)}>
              <SelectTrigger id="bill-category">
                <SelectValue placeholder="Opcional" />
              </SelectTrigger>
              <SelectContent>
                {mockCategories
                  .filter((c) => (isIncome ? c.kind === "receita" : c.kind === "despesa"))
                  .map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="bill-recurrence">Recorrência *</Label>
            <Select value={form.recurrence} onValueChange={(v) => v && handleChange("recurrence", v)}>
              <SelectTrigger id="bill-recurrence">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(BILL_RECURRENCES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="rounded-xl gap-2 mt-4">
            <Save className="size-4" />
            {isIncome ? "Criar Entrada Fixa" : "Criar Saída Fixa"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
