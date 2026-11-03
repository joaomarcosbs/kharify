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
import { FieldError } from "@/components/ui/field"
import { USER_ROLES } from "@/types/enums"
import type { UserRole } from "@/types/enums"
import { UserPlus, Save } from "lucide-react"

const schema = z.object({
  name: z.string().min(1, "O nome do membro é obrigatório."),
  email: z.email("Insira um e-mail válido."),
  document: z.string().min(11, "Informe um CPF válido."),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
  role: z.custom<UserRole>(
    (val) => ["owner", "gestor", "membro"].includes(val as string),
    { message: "Selecione uma função." }
  ),
})

type FormValues = z.infer<typeof schema>

interface MemberFormSheetProps {
  onSubmit?: (data: FormValues) => void
}

export function MemberFormSheet({ onSubmit }: MemberFormSheetProps) {
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      document: "",
      password: "",
      role: "membro",
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
        <UserPlus className="size-4" />
        Convidar Membro
      </SheetTrigger>
      <SheetContent className="sm:max-w-[440px] overflow-y-auto">
        <SheetHeader>
        <SheetTitle>Cadastrar Membro</SheetTitle>
        <SheetDescription>Cadastre o membro e envie a senha inicial manualmente.</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(processForm)} className="flex flex-col gap-5 mt-6 w-full">
          <div className="flex flex-col gap-2">
            <Label htmlFor="member-name">Nome completo *</Label>
            <Input id="member-name" placeholder="Ex: João Silva" {...register("name")} aria-invalid={!!errors.name} />
            {errors.name && <FieldError errors={[errors.name]} />}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="member-email">E-mail *</Label>
            <Input
              id="member-email"
              type="email"
              placeholder="Ex: email@kharify.com"
              {...register("email")}
              aria-invalid={!!errors.email}
            />
            {errors.email && <FieldError errors={[errors.email]} />}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="member-document">CPF *</Label>
            <Input id="member-document" placeholder="000.000.000-00" {...register("document")} aria-invalid={!!errors.document} />
            {errors.document && <FieldError errors={[errors.document]} />}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="member-password">Senha inicial *</Label>
            <div className="flex gap-2">
              <Input id="member-password" type="text" {...register("password")} aria-invalid={!!errors.password} />
              <Button
                type="button"
                variant="outline"
                onClick={() => reset((current) => ({ ...current, password: `${Math.random().toString(36).slice(2, 8)}A1!` }))}
              >
                Gerar
              </Button>
            </div>
            {errors.password && <FieldError errors={[errors.password]} />}
            <p className="text-xs text-muted-foreground">Copie a senha e envie ao membro. Ele poderá alterá-la depois.</p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="member-role">Função *</Label>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="member-role" aria-invalid={!!errors.role}>
                    <SelectValue>
                      {field.value
                        ? USER_ROLES[field.value as UserRole]
                        : "Selecione..."}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(USER_ROLES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.role && <FieldError errors={[errors.role]} />}
          </div>

          <Button type="submit" className="rounded-xl gap-2 mt-4">
            <Save className="size-4" />
            Adicionar Membro
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
