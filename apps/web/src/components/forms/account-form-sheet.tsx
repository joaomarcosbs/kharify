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
import { ACCOUNT_TYPES } from "@/types/enums"
import type { AccountType } from "@/types/enums"
import { Plus, Save } from "lucide-react"

const ACCOUNT_TYPE_VALUES = ["conta", "carteira", "cartao", "corretora"] as const;

const schema = z.object({
  name: z.string().min(1, "O nome da conta é obrigatório."),
  type: z.custom<AccountType>(
    (val) => ["conta", "carteira", "cartao", "corretora"].includes(val as string),
    { message: "Selecione um tipo." }
  ),
  initialBalance: z.coerce.number({
    message: "Insira um valor válido.",
  }),
  initialBalanceDate: z.date({
    message: "A data do saldo é obrigatória.",
  }),
})

type FormValues = z.infer<typeof schema>

interface AccountFormSheetProps {
  onSubmit?: (data: FormValues) => void
}

export function AccountFormSheet({ onSubmit }: AccountFormSheetProps) {
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    mode: "onTouched",
    defaultValues: {
      name: "",
      type: "conta",
      initialBalance: 0,
      initialBalanceDate: new Date(),
    },
  })

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
        Nova Conta
      </SheetTrigger>
      <SheetContent className="sm:max-w-[440px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Nova Conta Bancária</SheetTitle>
          <SheetDescription>Adicione uma nova conta para acompanhar seus saldos.</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(processForm)} className="flex flex-col gap-5 mt-6 w-full">
          <div className="flex flex-col gap-2">
            <Label htmlFor="acc-name">Nome da conta *</Label>
            <Input
              id="acc-name"
              placeholder="Ex: Nubank, Bradesco, Carteira"
              {...register("name")}
              aria-invalid={!!errors.name}
            />
            {errors.name && <FieldError errors={[errors.name]} />}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="acc-type">Tipo *</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="acc-type" aria-invalid={!!errors.type}>
                    <SelectValue>
                      {field.value
                        ? ACCOUNT_TYPES[field.value as AccountType]
                        : "Selecione..."}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ACCOUNT_TYPES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && <FieldError errors={[errors.type]} />}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="acc-balance">Saldo inicial (R$) *</Label>
              <Input
                id="acc-balance"
                type="number"
                step="0.01"
                placeholder="0,00"
                {...register("initialBalance")}
                aria-invalid={!!errors.initialBalance}
              />
              {errors.initialBalance && <FieldError errors={[errors.initialBalance]} />}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="acc-date">Data do saldo *</Label>
              <Controller
                control={control}
                name="initialBalanceDate"
                render={({ field }) => (
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.initialBalanceDate && <FieldError errors={[errors.initialBalanceDate]} />}
            </div>
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
