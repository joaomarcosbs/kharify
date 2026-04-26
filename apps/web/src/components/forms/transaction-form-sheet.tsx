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
import { TRANSACTION_TYPES } from "@/types/enums"
import type { TransactionType } from "@/types/enums"
import { mockAccounts } from "@/mocks/accounts"
import { mockCategories } from "@/mocks/categories"
import { Plus, Save } from "lucide-react"

const schema = z.object({
  type: z.enum(["entrada", "saida", "transferencia"] as const, {
    required_error: "Selecione um tipo.",
  }),
  accountId: z.string().min(1, "Conta de origem é obrigatória."),
  accountIdDest: z.string().optional(),
  categoryId: z.string().optional(),
  amount: z.coerce.number({
    invalid_type_error: "Insira um valor válido.",
  }).min(0.01, "O valor deve ser maior que zero."),
  date: z.date({
    required_error: "A data é obrigatória.",
  }),
  description: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.type === "transferencia" && !data.accountIdDest) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Conta de destino é obrigatória para transferências.",
      path: ["accountIdDest"],
    })
  }
})

type FormValues = z.infer<typeof schema>

interface TransactionFormSheetProps {
  onSubmit?: (data: FormValues) => void
}

export function TransactionFormSheet({ onSubmit }: TransactionFormSheetProps) {
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      type: "saida",
      accountId: "",
      accountIdDest: "",
      categoryId: "",
      amount: 0,
      date: new Date(),
      description: "",
    },
  })

  const selectedType = watch("type")
  const selectedAccountId = watch("accountId")

  const processForm = (data: FormValues) => {
    onSubmit?.(data)
    reset()
    setOpen(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) reset()
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger render={<Button className="rounded-xl gap-2" />}>
        <Plus className="size-4" />
        Novo Lançamento
      </SheetTrigger>
      <SheetContent className="sm:max-w-[440px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Novo Lançamento</SheetTitle>
          <SheetDescription>Registre uma nova movimentação financeira.</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(processForm)} className="flex flex-col gap-5 mt-6 w-full">
          <div className="flex flex-col gap-2">
            <Label htmlFor="tx-type">Tipo *</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="tx-type" aria-invalid={!!errors.type}>
                    <SelectValue>
                      {field.value
                        ? TRANSACTION_TYPES[field.value as TransactionType]
                        : "Selecione..."}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TRANSACTION_TYPES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && <FieldError errors={[errors.type]} />}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="tx-account">Conta de origem *</Label>
            <Controller
              control={control}
              name="accountId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="tx-account" aria-invalid={!!errors.accountId}>
                    {/* Using explicit text finding to bypass Base UI ID display issue */}
                    <SelectValue>
                      {field.value 
                        ? mockAccounts.find((a) => a.id === field.value)?.name 
                        : "Selecione uma conta"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {mockAccounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.accountId && <FieldError errors={[errors.accountId]} />}
          </div>

          {selectedType === "transferencia" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="tx-dest">Conta de destino *</Label>
              <Controller
                control={control}
                name="accountIdDest"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="tx-dest" aria-invalid={!!errors.accountIdDest}>
                      <SelectValue>
                        {field.value 
                          ? mockAccounts.find((a) => a.id === field.value)?.name 
                          : "Selecione a conta destino"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {mockAccounts.filter((a) => a.id !== selectedAccountId).map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.accountIdDest && <FieldError errors={[errors.accountIdDest]} />}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="tx-amount">Valor (R$) *</Label>
              <Input
                id="tx-amount"
                type="number"
                step="0.01"
                placeholder="0,00"
                {...register("amount")}
                aria-invalid={!!errors.amount}
              />
              {errors.amount && <FieldError errors={[errors.amount]} />}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="tx-date">Data *</Label>
              <Controller
                control={control}
                name="date"
                render={({ field }) => (
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.date && <FieldError errors={[errors.date]} />}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2 col-span-2">
              <Label htmlFor="tx-category">Categoria</Label>
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="tx-category" aria-invalid={!!errors.categoryId}>
                      <SelectValue>
                        {field.value 
                          ? mockCategories.find((c) => c.id === field.value)?.name 
                          : "Opcional"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {mockCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.categoryId && <FieldError errors={[errors.categoryId]} />}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="tx-desc">Descrição</Label>
            <Input
              id="tx-desc"
              placeholder="Descrição da transação"
              {...register("description")}
              aria-invalid={!!errors.description}
            />
            {errors.description && <FieldError errors={[errors.description]} />}
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
