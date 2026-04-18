"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Building2 } from "lucide-react"
import { ORGANIZATION_TYPES } from "@/types/enums"
import type { OrganizationType } from "@/types/enums"

export default function OrganizationPage() {
  const [form, setForm] = useState({
    name: "Marcos Família",
    type: "familia" as OrganizationType,
  })

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8">
      <PageHeader
        title="Organização"
        description="Gerencie os dados da sua organização."
        breadcrumbs={[
          { label: "Configurações", href: "/settings" },
          { label: "Organização" },
        ]}
      />

      <div className="rounded-[24px] bg-background dark:bg-sidebar p-8 shadow-[0_20px_40px_-5px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.2)] flex flex-col gap-6 max-w-2xl">
        <div className="flex items-center gap-4 mb-2">
          <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Building2 className="size-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{form.name}</h3>
            <p className="text-xs text-muted-foreground">{ORGANIZATION_TYPES[form.type]}</p>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="orgName">Nome da organização</Label>
            <Input id="orgName" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="orgType">Tipo</Label>
            <Select value={form.type} onValueChange={(v) => v && setForm((p) => ({ ...p, type: v as OrganizationType }))}>
              <SelectTrigger id="orgType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ORGANIZATION_TYPES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button className="rounded-xl gap-2">
            <Save className="size-4" />
            Salvar Alterações
          </Button>
        </div>
      </div>
    </div>
  )
}
