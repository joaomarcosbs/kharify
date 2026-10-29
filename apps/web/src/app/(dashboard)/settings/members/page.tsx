"use client"

import { useState, useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { PageHeader } from "@/components/page-header"
import { DataTable } from "@/components/dashboard/data-table"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { USER_ROLES } from "@/types/enums"
import type { UserRole } from "@/types/enums"
import { MemberFormSheet } from "@/components/forms/member-form-sheet"
import { UserPlus, Crown, Shield, User } from "lucide-react"

interface Member {
  id: string
  name: string
  email: string
  role: UserRole
  initials: string
}

const roleIcons = {
  owner: Crown,
  gestor: Shield,
  membro: User,
}

const roleColors = {
  owner: "text-amber-500 bg-amber-500/10",
  gestor: "text-blue-400 bg-blue-400/10",
  membro: "text-muted-foreground bg-muted/50",
}

const mockMembers: Member[] = [
  { id: "m-001", name: "João Marcos", email: "joao@kharify.com", role: "owner", initials: "JM" },
  { id: "m-002", name: "Maria Silva", email: "maria@kharify.com", role: "gestor", initials: "MS" },
  { id: "m-003", name: "Pedro Santos", email: "pedro@kharify.com", role: "membro", initials: "PS" },
]

export default function MembersPage() {
  const [members] = useState<Member[]>(mockMembers)

  const columns = useMemo<ColumnDef<Member, unknown>[]>(() => [
    {
      accessorKey: "name",
      header: "Membro",
      cell: ({ row }) => {
        const m = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-9 rounded-full">
              <AvatarFallback className="rounded-full bg-primary/10 text-primary text-xs">{m.initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-sm">{m.name}</span>
              <span className="text-xs text-muted-foreground">{m.email}</span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "role",
      header: "Função",
      cell: ({ row }) => {
        const m = row.original
        const Icon = roleIcons[m.role]
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[13px] font-medium ${roleColors[m.role]}`}>
            <Icon className="size-3.5" />
            {USER_ROLES[m.role]}
          </span>
        )
      },
    },
  ], [])

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8">
      <PageHeader
        title="Membros"
        description="Gerencie os membros da sua organização."
        breadcrumbs={[
          { label: "Configurações", href: "/settings" },
          { label: "Membros" },
        ]}
        actions={
          <MemberFormSheet />
        }
      />

      <DataTable
        columns={columns}
        data={members}
        emptyMessage="Nenhum membro encontrado"
      />
    </div>
  )
}
