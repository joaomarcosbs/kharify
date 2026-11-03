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
import { DatePicker } from "@/components/ui/date-picker"
import { FieldError } from "@/components/ui/field"
import type { Debt } from "@/types/entities"
import { debtsService } from "@/services/debts.service"
import { Plus, Save } from "lucide-react"

const schema = z.object({
  name: z.string().min(1, "O nome da dívida é obrigatório."),
  originalAmount: z.coerce.number({
    message: "Insira um valor válido.",
  }).min(0.01, "O valor deve ser maior que zero."),
  interestRateMonth: z.coerce.number().optional().or(z.literal("")),
  totalInstallments: z.coerce.number().optional().or(z.literal("")),
  startDate: z.date({
    message: "A data de início é obrigatória.",
  }),
})

type FormValues = z.infer<typeof schema>

interface DebtFormSheetProps {
  initialData?: Debt | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSubmit?: (data: {
    name: string
    originalAmount: number
    interestRateMonth?: number
    totalInstallments?: number
    startDate: string
  }) => void
  onDebtSaved?: () => void
}

export function DebtFormSheet({
  initialData,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  onSubmit,
  onDebtSaved,
}: DebtFormSheetProps) {
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

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    mode: "onBlur",
    defaultValues: {
      name: "",
      originalAmount: 0,
      interestRateMonth: "",
      totalInstallments: "",
      startDate: new Date(),
    },
  })

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        originalAmount: initialData.originalAmount,
        interestRateMonth: initialData.interestRateMonth ?? "",
        totalInstallments: initialData.totalInstallments ?? "",
        startDate: initialData.startDate ? new Date(initialData.startDate) : new Date(),
      })
    } else {
      reset({
        name: "",
        originalAmount: 0,
        interestRateMonth: "",
        totalInstallments: "",
        startDate: new Date(),
      })
    }
  }, [initialData, reset, open])

  const processForm = async (data: FormValues) => {
    const payload = {
      name: data.name,
      originalAmount: Number(data.originalAmount),
      interestRateMonth: data.interestRateMonth ? Number(data.interestRateMonth) : undefined,
      totalInstallments: data.totalInstallments ? Number(data.totalInstallments) : undefined,
      startDate: data.startDate.toISOString().split("T")[0],
    }
    if (onSubmit) {
      onSubmit(payload)
    } else if (initialData) {
      await debtsService.update(initialData.id, payload)
    } else {
      await debtsService.create({
        ...payload,
        status: "ativa",
      })
    }
    reset()
    setOpen(false)
    onDebtSaved?.()
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) reset()
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      {!isControlled && (
        <SheetTrigger render={<Button className="rounded-xl gap-2" />}>
          <Plus className="size-4" />
          Nova Dívida
        </SheetTrigger>
      )}
      <SheetContent className="sm:max-w-[440px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{initialData ? "Editar Dívida" : "Nova Dívida"}</SheetTitle>
          <SheetDescription>
            {initialData
              ? "Atualize as informações do seu passivo ou financiamento."
              : "Cadastre uma dívida para acompanhar e simular quitação."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(processForm)} className="flex flex-col gap-5 mt-6 w-full">
          <div className="flex flex-col gap-2">
            <Label htmlFor="debt-name">Nome da dívida *</Label>
            <Input
              id="debt-name"
              placeholder="Ex: Financiamento Carro, Cartão Crédito"
              {...register("name")}
              aria-invalid={!!errors.name}
            />
            {errors.name && <FieldError errors={[errors.name]} />}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="debt-amount">Valor (R$) *</Label>
              <Input
                id="debt-amount"
                type="number"
                step="0.01"
                placeholder="0,00"
                {...register("originalAmount")}
                aria-invalid={!!errors.originalAmount}
              />
              {errors.originalAmount && <FieldError errors={[errors.originalAmount]} />}
            </div>
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="debt-interest">Juros/mês (%)</Label>
              <Input
                id="debt-interest"
                type="number"
                step="0.01"
                placeholder="1.99"
                {...register("interestRateMonth")}
                aria-invalid={!!errors.interestRateMonth}
              />
              {errors.interestRateMonth && <FieldError errors={[errors.interestRateMonth]} />}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="debt-installments">Parcelas (Qtd)</Label>
              <Input
                id="debt-installments"
                type="number"
                placeholder="48"
                {...register("totalInstallments")}
                aria-invalid={!!errors.totalInstallments}
              />
              {errors.totalInstallments && <FieldError errors={[errors.totalInstallments]} />}
            </div>
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="debt-start">Data de início *</Label>
              <Controller
                control={control}
                name="startDate"
                render={({ field }) => (
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.startDate && <FieldError errors={[errors.startDate]} />}
            </div>
          </div>

          <Button type="submit" className="rounded-xl gap-2 mt-4">
            <Save className="size-4" />
            {initialData ? "Salvar Alterações" : "Criar Dívida"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
