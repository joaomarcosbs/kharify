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
import { Plus, Save } from "lucide-react"

interface DebtFormSheetProps {
  onSubmit?: (data: {
    name: string
    originalAmount: number
    interestRateMonth?: number
    totalInstallments?: number
    installmentAmount?: number
    startDate: string
  }) => void
}

export function DebtFormSheet({ onSubmit }: DebtFormSheetProps) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: "",
    originalAmount: "",
    interestRateMonth: "",
    totalInstallments: "",
    installmentAmount: "",
    startDate: new Date().toISOString().split("T")[0],
  })

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.({
      name: form.name,
      originalAmount: Number(form.originalAmount),
      interestRateMonth: form.interestRateMonth ? Number(form.interestRateMonth) : undefined,
      totalInstallments: form.totalInstallments ? Number(form.totalInstallments) : undefined,
      installmentAmount: form.installmentAmount ? Number(form.installmentAmount) : undefined,
      startDate: form.startDate,
    })
    setForm({ name: "", originalAmount: "", interestRateMonth: "", totalInstallments: "", installmentAmount: "", startDate: new Date().toISOString().split("T")[0] })
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button className="rounded-xl gap-2" />}>
          <Plus className="size-4" />
          Nova Dívida
      </SheetTrigger>
      <SheetContent className="sm:max-w-[440px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Nova Dívida</SheetTitle>
          <SheetDescription>Cadastre uma dívida para acompanhar e simular quitação.</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="debt-name">Nome da dívida *</Label>
            <Input
              id="debt-name"
              placeholder="Ex: Financiamento Carro, Cartão Crédito"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="debt-amount">Valor original (R$) *</Label>
            <Input
              id="debt-amount"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={form.originalAmount}
              onChange={(e) => handleChange("originalAmount", e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="debt-interest">Juros mensal (%)</Label>
            <Input
              id="debt-interest"
              type="number"
              step="0.01"
              placeholder="Ex: 1.99"
              value={form.interestRateMonth}
              onChange={(e) => handleChange("interestRateMonth", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="debt-installments">Total de parcelas</Label>
              <Input
                id="debt-installments"
                type="number"
                placeholder="Ex: 48"
                value={form.totalInstallments}
                onChange={(e) => handleChange("totalInstallments", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="debt-installment-amount">Valor da parcela (R$)</Label>
              <Input
                id="debt-installment-amount"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={form.installmentAmount}
                onChange={(e) => handleChange("installmentAmount", e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="debt-start">Data de início *</Label>
            <Input
              id="debt-start"
              type="date"
              value={form.startDate}
              onChange={(e) => handleChange("startDate", e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="rounded-xl gap-2 mt-4">
            <Save className="size-4" />
            Criar Dívida
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
