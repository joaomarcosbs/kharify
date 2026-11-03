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
import { ACCOUNT_TYPES } from "@/types/enums"
import type { AccountType } from "@/types/enums"
import type { Account } from "@/types/entities"
import { accountsService } from "@/services/accounts.service"
import { Plus, Save } from "lucide-react"

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
  initialData?: Account | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSubmit?: (data: FormValues) => void
  onAccountCreated?: () => void
}

export function AccountFormSheet({
  initialData,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  onSubmit,
  onAccountCreated,
}: AccountFormSheetProps) {
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
    mode: "onTouched",
    defaultValues: {
      name: "",
      type: "conta",
      initialBalance: 0,
      initialBalanceDate: new Date(),
    },
  })

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        type: initialData.type,
        initialBalance: initialData.initialBalance,
        initialBalanceDate: initialData.initialBalanceDate ? new Date(initialData.initialBalanceDate) : new Date(),
      })
    } else {
      reset({
        name: "",
        type: "conta",
        initialBalance: 0,
        initialBalanceDate: new Date(),
      })
    }
  }, [initialData, reset, open])

  const processForm = async (data: FormValues) => {
    if (onSubmit) {
      onSubmit(data)
    } else if (initialData) {
      await accountsService.update(initialData.id, {
        name: data.name,
        type: data.type,
      })
    } else {
      await accountsService.create({
        name: data.name,
        type: data.type,
        initialBalance: data.initialBalance,
        initialBalanceDate: data.initialBalanceDate.toISOString().split("T")[0],
      })
    }
    reset()
    setOpen(false)
    onAccountCreated?.()
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
          Nova Conta
        </SheetTrigger>
      )}
      <SheetContent className="sm:max-w-[440px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{initialData ? "Editar Conta" : "Nova Conta Bancária"}</SheetTitle>
          <SheetDescription>
            {initialData
              ? "Atualize as informações da conta."
              : "Adicione uma nova conta para acompanhar seus saldos."}
          </SheetDescription>
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
                disabled={!!initialData}
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
                    disabled={!!initialData}
                  />
                )}
              />
              {errors.initialBalanceDate && <FieldError errors={[errors.initialBalanceDate]} />}
            </div>
          </div>

          <Button type="submit" className="rounded-xl gap-2 mt-4">
            <Save className="size-4" />
            {initialData ? "Salvar Alterações" : "Criar Conta"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
