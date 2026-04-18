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
import { ACCOUNT_TYPES } from "@/types/enums"
import type { AccountType } from "@/types/enums"
import { Plus, Save } from "lucide-react"

interface AccountFormSheetProps {
  onSubmit?: (data: {
    name: string
    type: AccountType
    initialBalance: number
    initialBalanceDate: string
  }) => void
}

export function AccountFormSheet({ onSubmit }: AccountFormSheetProps) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: "",
    type: "conta" as AccountType,
    initialBalance: "",
    initialBalanceDate: new Date().toISOString().split("T")[0],
  })

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.({
      name: form.name,
      type: form.type,
      initialBalance: Number(form.initialBalance),
      initialBalanceDate: form.initialBalanceDate,
    })
    setForm({ name: "", type: "conta", initialBalance: "", initialBalanceDate: new Date().toISOString().split("T")[0] })
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button className="rounded-xl gap-2" />}>
          <Plus className="size-4" />
          Nova Conta
      </SheetTrigger>
      <SheetContent className="sm:max-w-[440px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Nova Conta Bancária</SheetTitle>
          <SheetDescription>Adicione uma nova conta para acompanhar seus saldos.</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="acc-name">Nome da conta *</Label>
            <Input
              id="acc-name"
              placeholder="Ex: Nubank, Bradesco, Carteira"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="acc-type">Tipo *</Label>
            <Select value={form.type} onValueChange={(v) => v && handleChange("type", v)}>
              <SelectTrigger id="acc-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ACCOUNT_TYPES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="acc-balance">Saldo inicial (R$) *</Label>
            <Input
              id="acc-balance"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={form.initialBalance}
              onChange={(e) => handleChange("initialBalance", e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="acc-date">Data do saldo inicial *</Label>
            <Input
              id="acc-date"
              type="date"
              value={form.initialBalanceDate}
              onChange={(e) => handleChange("initialBalanceDate", e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="rounded-xl gap-2 mt-4">
            <Save className="size-4" />
            Criar Conta
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
