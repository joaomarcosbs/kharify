"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Save, Camera } from "lucide-react"

export default function ProfilePage() {
  const [form, setForm] = useState({
    name: "João Marcos",
    email: "joao@kharify.com",
    phone: "(11) 99999-8888",
    cpf: "123.456.789-00",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8">
      <PageHeader
        title="Meu Perfil"
        description="Gerencie suas informações pessoais."
        breadcrumbs={[
          { label: "Configurações", href: "/settings" },
          { label: "Meu Perfil" },
        ]}
      />

      <div className="grid gap-8 md:grid-cols-[280px_1fr]">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-4 rounded-[24px] bg-background dark:bg-sidebar p-8 shadow-[0_20px_40px_-5px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.2)] h-fit">
          <div className="relative group">
            <Avatar className="size-24 rounded-full">
              <AvatarImage src="" alt="João Marcos" />
              <AvatarFallback className="rounded-[inherit] bg-primary/10 text-primary text-2xl">JM</AvatarFallback>
            </Avatar>
            <label className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              <Camera className="size-6 text-white" />
              <input type="file" className="hidden" accept="image/*" />
            </label>
          </div>
          <div className="text-center">
            <p className="font-semibold">{form.name}</p>
            <p className="text-xs text-muted-foreground">{form.email}</p>
          </div>
        </div>

        {/* Formulário */}
        <div className="rounded-[24px] bg-background dark:bg-sidebar p-8 shadow-[0_20px_40px_-5px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.2)] flex flex-col gap-6">
          <h3 className="font-semibold text-lg">Dados Pessoais</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input id="name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} placeholder="(00) 00000-0000" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input id="cpf" value={form.cpf} className="bg-muted/50 text-muted-foreground" readOnly placeholder="000.000.000-00" />
            </div>
          </div>

          <div className="border-t border-border/50 pt-6 mt-2">
            <h3 className="font-semibold text-lg mb-4">Alterar Senha</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="currentPassword">Senha atual</Label>
                <Input id="currentPassword" type="password" value={form.currentPassword} onChange={(e) => handleChange("currentPassword", e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="newPassword">Nova senha</Label>
                <Input id="newPassword" type="password" value={form.newPassword} onChange={(e) => handleChange("newPassword", e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <Input id="confirmPassword" type="password" value={form.confirmPassword} onChange={(e) => handleChange("confirmPassword", e.target.value)} />
              </div>
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
    </div>
  )
}
