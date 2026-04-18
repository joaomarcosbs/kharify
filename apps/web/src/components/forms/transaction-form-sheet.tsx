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
import { TRANSACTION_TYPES } from "@/types/enums"
import type { TransactionType } from "@/types/enums"
import { mockAccounts } from "@/mocks/accounts"
import { mockCategories } from "@/mocks/categories"
import { Plus, Save } from "lucide-react"

interface TransactionFormSheetProps {
  onSubmit?: (data: {
    type: TransactionType
    accountId: string
    accountIdDest?: string
    categoryId?: string
    amount: number
    date: string
    description?: string
  }) => void
}

export function TransactionFormSheet({ onSubmit }: TransactionFormSheetProps) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    type: "saida" as TransactionType,
    accountId: "",
    accountIdDest: "",
    categoryId: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
  })

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.({
      type: form.type,
      accountId: form.accountId,
      accountIdDest: form.type === "transferencia" ? form.accountIdDest : undefined,
      categoryId: form.categoryId || undefined,
      amount: Number(form.amount),
      date: form.date,
      description: form.description || undefined,
    })
    setForm({ type: "saida", accountId: "", accountIdDest: "", categoryId: "", amount: "", date: new Date().toISOString().split("T")[0], description: "" })
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button className="rounded-xl gap-2" />}>
          <Plus className="size-4" />
          Novo Lançamento
      </SheetTrigger>
      <SheetContent className="sm:max-w-[440px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Novo Lançamento</SheetTitle>
          <SheetDescription>Registre uma nova movimentação financeira.</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="tx-type">Tipo *</Label>
            <Select value={form.type} onValueChange={(v) => v && handleChange("type", v)}>
              <SelectTrigger id="tx-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TRANSACTION_TYPES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="tx-account">Conta de origem *</Label>
            <Select value={form.accountId} onValueChange={(v) => v && handleChange("accountId", v)}>
              <SelectTrigger id="tx-account">
                <SelectValue placeholder="Selecione uma conta" />
              </SelectTrigger>
              <SelectContent>
                {mockAccounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {form.type === "transferencia" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="tx-dest">Conta de destino *</Label>
              <Select value={form.accountIdDest} onValueChange={(v) => v && handleChange("accountIdDest", v)}>
                <SelectTrigger id="tx-dest">
                  <SelectValue placeholder="Selecione a conta destino" />
                </SelectTrigger>
                <SelectContent>
                  {mockAccounts.filter((a) => a.id !== form.accountId).map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="tx-category">Categoria</Label>
            <Select value={form.categoryId} onValueChange={(v) => v && handleChange("categoryId", v)}>
              <SelectTrigger id="tx-category">
                <SelectValue placeholder="Opcional" />
              </SelectTrigger>
              <SelectContent>
                {mockCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="tx-amount">Valor (R$) *</Label>
            <Input
              id="tx-amount"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={form.amount}
              onChange={(e) => handleChange("amount", e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="tx-date">Data *</Label>
            <Input
              id="tx-date"
              type="date"
              value={form.date}
              onChange={(e) => handleChange("date", e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="tx-desc">Descrição</Label>
            <Input
              id="tx-desc"
              placeholder="Descrição da transação"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <Button type="submit" className="rounded-xl gap-2 mt-4">
            <Save className="size-4" />
            Registrar Lançamento
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
