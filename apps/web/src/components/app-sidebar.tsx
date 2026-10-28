import * as React from "react"
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Building2,
  ChevronRight,
  Home,
  Landmark,
  LogOut,
  Settings,
  TrendingDown,
  User,
  UserPlus,
  Settings2,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const data = {
  navMain: [
    {
      title: "Visão Geral",
      url: "/home",
      icon: Home,
    },
    {
      title: "Contas Bancárias",
      url: "/accounts",
      icon: Landmark,
    },
    {
      title: "Transações",
      url: "/transactions",
      icon: ArrowLeftRight,
    },
    {
      title: "Entradas Fixas",
      url: "/fixed-income",
      icon: ArrowDownLeft,
    },
    {
      title: "Saídas Fixas",
      url: "/fixed-expenses",
      icon: ArrowUpRight,
    },
    {
      title: "Dívidas",
      url: "/debts",
      icon: TrendingDown,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="floating" collapsible="icon" {...props}>
      <SidebarHeader className="h-16 relative flex items-center bg-transparent shrink-0 p-4">
        <span className="font-bold text-xl tracking-tight transition-all duration-200 ease-linear max-w-[200px] overflow-hidden whitespace-nowrap group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0">
          Kharify
        </span>
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-xl tracking-tight opacity-0 scale-50 transition-all duration-200 ease-linear group-data-[collapsible=icon]:opacity-100 group-data-[collapsible=icon]:scale-100">
          K
        </span>
      </SidebarHeader>

      <SidebarContent>
        {/* Navegação principal */}
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:mt-0! transition-opacity duration-200">Plataforma</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1 mt-2">
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    render={<a href={item.url} />}
                    className="text-[15px] [&>svg]:size-5 py-5"
                  >
                    <item.icon />
                    <span className="truncate">
                      {item.title}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Configurações — acima do footer */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Configurações"
                  render={<a href="/settings" />}
                  className="text-[15px] [&>svg]:size-5 py-5"
                >
                  <Settings />
                  <span className="truncate">Configurações</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <SidebarMenuButton
                  size="lg"
                  className="w-full data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                />
              }>
                <Avatar className="h-8 w-8 rounded-full shrink-0">
                  <AvatarImage src="" alt="João Marcos" />
                  <AvatarFallback className="rounded-[inherit] bg-primary/10 text-primary">JM</AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col text-left text-sm leading-tight overflow-hidden">
                  <span className="truncate font-semibold text-foreground">João Marcos</span>
                  <span className="truncate text-xs text-muted-foreground">Admin</span>
                </div>
                <ChevronRight className="ml-auto size-4 text-muted-foreground shrink-0" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 rounded-lg shadow-xl border-border"
                side="right"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem className="cursor-pointer gap-2" render={<a href="/settings/profile" />}>
                  <User className="size-4" />
                  Meu Perfil
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer gap-2" render={<a href="/settings/organization" />}>
                  <Building2 className="size-4" />
                  Organização
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer gap-2" render={<a href="/settings/members" />}>
                  <UserPlus className="size-4" />
                  Membros
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer gap-2" render={<a href="/settings/appearance" />}>
                  <Settings className="size-4" />
                  Aparência
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer gap-2" render={<a href="/settings/preferences" />}>
                  <Settings2 className="size-4" />
                  Preferências
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer gap-2 text-red-400 focus:text-red-400">
                  <LogOut className="size-4" />
                  Sair da Conta
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
