"use client"

import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, Save } from "lucide-react"

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
import { CATEGORY_GROUP_TYPES, CATEGORY_KINDS } from "@/types/enums"
import type { Category } from "@/types/entities"
import type { CategoryGroupType, CategoryKind } from "@/types/enums"
import { categoriesService } from "@/services/categories.service"

const schema = z.object({
  name: z.string().min(1, "O nome da categoria é obrigatório."),
  kind: z.custom<CategoryKind>(
    (value) => ["receita", "despesa"].includes(value as string),
    { message: "Selecione o tipo da categoria." },
  ),
  groupType: z.custom<CategoryGroupType>(
    (value) => ["essencial", "necessario", "superfluo"].includes(value as string),
    { message: "Selecione o grupo da categoria." },
  ),
})

type FormValues = z.infer<typeof schema>

interface CategoryFormSheetProps {
  initialData?: Category | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onCategorySaved?: () => void
}

export function CategoryFormSheet({
  initialData,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  onCategorySaved,
}: CategoryFormSheetProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen

  const setOpen = (value: boolean) => {
    if (isControlled) setControlledOpen?.(value)
    else setInternalOpen(value)
  }

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { name: "", kind: "despesa", groupType: "necessario" },
  })

  useEffect(() => {
    reset(initialData
      ? { name: initialData.name, kind: initialData.kind, groupType: initialData.groupType }
      : { name: "", kind: "despesa", groupType: "necessario" })
  }, [initialData, open, reset])

  const processForm = async (data: FormValues) => {
    if (initialData) await categoriesService.update(initialData.id, data)
    else await categoriesService.create(data)
    setOpen(false)
    reset()
    onCategorySaved?.()
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <SheetTrigger render={<Button className="rounded-xl gap-2" />}>
          <Plus className="size-4" />
          Nova Categoria
        </SheetTrigger>
      )}
      <SheetContent className="sm:max-w-[440px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{initialData ? "Editar Categoria" : "Nova Categoria"}</SheetTitle>
          <SheetDescription>
            Organize receitas e despesas para acompanhar melhor sua vida financeira.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(processForm)} className="flex flex-col gap-5 mt-6 w-full">
          <div className="flex flex-col gap-2">
            <Label htmlFor="category-name">Nome *</Label>
            <Input id="category-name" placeholder="Ex: Alimentação" {...register("name")} aria-invalid={!!errors.name} />
            {errors.name && <FieldError errors={[errors.name]} />}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="category-kind">Tipo *</Label>
            <Controller
              control={control}
              name="kind"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="category-kind" aria-invalid={!!errors.kind}>
                    <SelectValue>{field.value ? CATEGORY_KINDS[field.value] : "Selecione..."}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_KINDS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.kind && <FieldError errors={[errors.kind]} />}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="category-group">Grupo *</Label>
            <Controller
              control={control}
              name="groupType"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="category-group" aria-invalid={!!errors.groupType}>
                    <SelectValue>{field.value ? CATEGORY_GROUP_TYPES[field.value] : "Selecione..."}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_GROUP_TYPES).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.groupType && <FieldError errors={[errors.groupType]} />}
          </div>

          <Button type="submit" className="rounded-xl gap-2 mt-4">
            <Save className="size-4" />
            {initialData ? "Salvar Alterações" : "Criar Categoria"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
