"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import type { Resolver } from "react-hook-form"
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
import type { Category, Bill } from "@/types/entities"
import { categoriesService } from "@/services/categories.service"
import { billsService } from "@/services/bills.service"
import { Plus, Save } from "lucide-react"

const schema = z.object({
  amount: z.coerce.number({
    message: "Insira um valor válido.",
  }).min(0.01, "O valor não pode ser zero."),
  dueDate: z.date({
    message: "A data de vencimento é obrigatória.",
  }),
  categoryId: z.string().optional(),
  recurrence: z.custom<BillRecurrence>(
    (val) => ["nenhuma", "mensal", "anual"].includes(val as string),
    { message: "Selecione uma recorrência." }
  ),
  description: z.string().min(1, "A descrição é obrigatória."),
})

type FormValues = z.infer<typeof schema>

interface BillFormSheetProps {
  type: BillType
  buttonLabel?: string
  initialData?: Bill | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSubmit?: (data: FormValues & { type: BillType }) => void
  onBillSaved?: () => void
}

export function BillFormSheet({
  type,
  buttonLabel = "Nova Conta",
  initialData,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  onSubmit,
  onBillSaved,
}: BillFormSheetProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen

  const setOpen = (newOpen: boolean) => {
    if (isControlled) {
      setControlledOpen?.(newOpen)
    } else {
      setInternalOpen(newOpen)
    }
  }

  const [categories, setCategories] = useState<Category[]>([])
  const isIncome = type === "receber"

  useEffect(() => {
    categoriesService.findAll().then(setCategories)
  }, [open])

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    mode: "onTouched",
    defaultValues: {
      amount: 0,
      dueDate: new Date(),
      categoryId: "",
      recurrence: "mensal",
      description: "",
    },
  })

  useEffect(() => {
    if (initialData) {
      reset({
        amount: initialData.amount,
        dueDate: initialData.dueDate ? new Date(initialData.dueDate) : new Date(),
        categoryId: initialData.categoryId || "",
        recurrence: initialData.recurrence,
        description: initialData.description || "",
      })
    } else {
      reset({
        amount: 0,
        dueDate: new Date(),
        categoryId: "",
        recurrence: "mensal",
        description: "",
      })
    }
  }, [initialData, reset, open])

  const processForm = async (data: FormValues) => {
    if (onSubmit) {
      onSubmit({ ...data, type })
    } else if (initialData) {
      await billsService.update(initialData.id, {
        amount: data.amount,
        dueDate: data.dueDate.toISOString(),
        categoryId: data.categoryId || undefined,
        recurrence: data.recurrence,
        description: data.description,
      })
    } else {
      await billsService.create({
        type,
        amount: data.amount,
        dueDate: data.dueDate.toISOString(),
        categoryId: data.categoryId || undefined,
        recurrence: data.recurrence,
        description: data.description,
      })
    }
    reset()
    setOpen(false)
    onBillSaved?.()
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) reset()
  }

  const filteredCategories = categories.filter(
    (c) => (isIncome ? c.kind === "receita" : c.kind === "despesa")
  )

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      {!isControlled && (
        <SheetTrigger render={<Button className="rounded-xl gap-2" />}>
          <Plus className="size-4" />
          {buttonLabel}
        </SheetTrigger>
      )}
      <SheetContent className="sm:max-w-[440px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {initialData
              ? (isIncome ? "Editar Entrada Fixa" : "Editar Saída Fixa")
              : (isIncome ? "Nova Entrada Fixa" : "Nova Saída Fixa")}
          </SheetTitle>
          <SheetDescription>
            {isIncome
              ? "Cadastre ou edite uma receita recorrente ou recebível agendado."
              : "Cadastre ou edite uma obrigação recorrente ou pagamento agendado."}
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
            {initialData ? "Salvar Alterações" : (isIncome ? "Criar Entrada Fixa" : "Criar Saída Fixa")}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
