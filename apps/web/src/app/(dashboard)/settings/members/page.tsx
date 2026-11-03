"use client"

import { useEffect, useState, useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { PageHeader } from "@/components/page-header"
import { DataTable } from "@/components/dashboard/data-table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { USER_ROLES } from "@/types/enums"
import type { UserRole } from "@/types/enums"
import { MemberFormSheet } from "@/components/forms/member-form-sheet"
import { Crown, Shield, User } from "lucide-react"
import { useOrganizationStore } from "@/stores/organization-store"
import { organizationService } from "@/services/organization.service"
import { toast } from "sonner"

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

export default function MembersPage() {
  const activeOrganization = useOrganizationStore((state) => state.activeOrganization)
  const [members, setMembers] = useState<Member[]>([])

  const loadMembers = async () => {
    if (!activeOrganization) return
    const data = await organizationService.getMembers(activeOrganization.id)
    setMembers(data.map((member) => ({ ...member, initials: member.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() })))
  }

  useEffect(() => {
    if (!activeOrganization) return
    organizationService.getMembers(activeOrganization.id)
      .then((data) => setMembers(data.map((member) => ({
        ...member,
        initials: member.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(),
      }))))
      .catch(() => toast.error("Não foi possível carregar os membros."))
  }, [activeOrganization])

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
          <MemberFormSheet onSubmit={async (data) => {
            if (!activeOrganization) return
            try {
              await organizationService.addMember(activeOrganization.id, {
                name: data.name,
                email: data.email,
                document: data.document,
                password: data.password,
                role: data.role as UserRole,
              })
              await loadMembers()
              toast.success("Membro adicionado.")
            } catch {
              toast.error("Não foi possível adicionar o membro.")
            }
          }} />
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
