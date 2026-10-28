"use client"

import { PageHeader } from "@/components/page-header"
import {
  User,
  Building2,
  Users,
  Palette,
  Settings2,
  ChevronRight
} from "lucide-react"
import Link from "next/link"

const settingsAreas = [
  {
    category: "Pessoal",
    items: [
      {
        title: "Meu Perfil",
        description: "Suas informações pessoais, senha e avatar.",
        icon: User,
        href: "/settings/profile",
      },
      {
        title: "Organização",
        description: "Dados básicos e CNPJ da sua empresa.",
        icon: Building2,
        href: "/settings/organization",
      },
      {
        title: "Membros",
        description: "Gerencie quem tem acesso à sua plataforma.",
        icon: Users,
        href: "/settings/members",
      },
    ]
  },
  {
    category: "Sistema",
    items: [
      {
        title: "Aparência",
        description: "Temas e cores",
        icon: Palette,
        href: "/settings/appearance",
      },
      {
        title: "Preferências",
        description: "Moeda, mês contábil e notificações.",
        icon: Settings2,
        href: "/settings/preferences",
      },
    ]
  }
]

export default function SettingsHubPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 pb-12">
      <PageHeader
        title="Configurações"
        description="Gerencie todas as preferências da sua conta e interface."
        breadcrumbs={[]}
      />

      <div className="flex flex-col gap-10">
        {settingsAreas.map((area) => (
          <div key={area.category} className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-muted-foreground px-2 uppercase tracking-wider">
              {area.category}
            </h2>
            <div className="flex flex-col rounded-2xl bg-background dark:bg-sidebar border border-border/50 shadow-sm overflow-hidden">
              {area.items.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors ${index !== area.items.length - 1 ? "border-b border-border/50" : ""
                    }`}
                >
                  <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary shrink-0">
                    <item.icon className="size-5" />
                  </div>
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <span className="font-medium text-[15px] text-foreground">{item.title}</span>
                    <span className="text-[13px] text-muted-foreground truncate">{item.description}</span>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground/50 shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
