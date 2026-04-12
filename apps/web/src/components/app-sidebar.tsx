import * as React from "react"
import {
  Calculator,
  ChevronRight,
  FileText,
  Home,
  Settings,
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
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const data = {
  navMain: [
    {
      title: "Visão Geral",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Gestão Financeira",
      url: "/dashboard/financeiro",
      icon: Calculator,
    },
    {
      title: "Relatórios",
      url: "/dashboard/relatorios",
      icon: FileText,
    },
    {
      title: "Configurações",
      url: "/dashboard/config",
      icon: Settings,
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
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:!mt-0 transition-opacity duration-200">Plataforma</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1 mt-2">
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    render={<a href={item.url} />}
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
                <Avatar className="h-8 w-8 rounded-lg shrink-0">
                  <AvatarImage src="/avatars/john.jpg" alt="John Doe" />
                  <AvatarFallback className="rounded-lg bg-primary/10 text-primary">JD</AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col text-left text-sm leading-tight overflow-hidden">
                  <span className="truncate font-semibold text-foreground">John Doe</span>
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
                <DropdownMenuItem className="cursor-pointer">Sair da Conta</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
