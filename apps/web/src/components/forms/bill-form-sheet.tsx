"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

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
import { DatePicker } from "@/components/ui/date-picker"
import { FieldError } from "@/components/ui/field"
import { BILL_RECURRENCES } from "@/types/enums"
import type { BillType, BillRecurrence } from "@/types/enums"
import { mockCategories } from "@/mocks/categories"
import { Plus, Save } from "lucide-react"

const schema = z.object({
  amount: z.coerce.number({
    invalid_type_error: "Insira um valor válido.",
  }).min(0.01, "O valor não pode ser zero."),
  dueDate: z.date({
    required_error: "A data de vencimento é obrigatória.",
  }),
  categoryId: z.string().optional(),
  recurrence: z.enum(["nenhuma", "mensal", "anual"] as const, {
    required_error: "Selecione uma recorrência.",
  }),
  description: z.string().min(1, "A descrição é obrigatória."),
})

type FormValues = z.infer<typeof schema>

interface BillFormSheetProps {
  type: BillType
  buttonLabel: string
  onSubmit?: (data: FormValues & { type: BillType }) => void
}

export function BillFormSheet({ type, buttonLabel, onSubmit }: BillFormSheetProps) {
  const [open, setOpen] = useState(false)
  const isIncome = type === "receber"

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      amount: 0,
      dueDate: new Date(),
      categoryId: "",
      recurrence: "mensal",
      description: "",
    },
  })

  const processForm = (data: FormValues) => {
    onSubmit?.({ ...data, type })
    reset()
    setOpen(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) reset()
  }

  const filteredCategories = mockCategories.filter(
    (c) => (isIncome ? c.kind === "receita" : c.kind === "despesa")
  )

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
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

        <form onSubmit={handleSubmit(processForm)} className="flex flex-col gap-5 mt-6 w-full">
          <div className="flex flex-col gap-2">
            <Label htmlFor="bill-desc">Descrição *</Label>
            <Input
              id="bill-desc"
              placeholder={isIncome ? "Ex: Aluguel recebido, Freelance" : "Ex: Aluguel, Internet, Luz"}
              {...register("description")}
              aria-invalid={!!errors.description}
            />
            {errors.description && <FieldError errors={[errors.description]} />}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="bill-amount">Valor (R$) *</Label>
              <Input
                id="bill-amount"
                type="number"
                step="0.01"
                placeholder="0,00"
                {...register("amount")}
                aria-invalid={!!errors.amount}
              />
              {errors.amount && <FieldError errors={[errors.amount]} />}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="bill-due">Vencimento *</Label>
              <Controller
                control={control}
                name="dueDate"
                render={({ field }) => (
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.dueDate && <FieldError errors={[errors.dueDate]} />}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="bill-category">Categoria</Label>
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="bill-category" aria-invalid={!!errors.categoryId}>
                      <SelectValue>
                        {field.value 
                          ? filteredCategories.find((cat) => cat.id === field.value)?.name 
                          : "Opcional"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.categoryId && <FieldError errors={[errors.categoryId]} />}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="bill-recurrence">Recorrência *</Label>
              <Controller
                control={control}
                name="recurrence"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="bill-recurrence" aria-invalid={!!errors.recurrence}>
                      <SelectValue>
                        {field.value
                          ? BILL_RECURRENCES[field.value as BillRecurrence]
                          : "Selecione..."}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(BILL_RECURRENCES).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.recurrence && <FieldError errors={[errors.recurrence]} />}
            </div>
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
