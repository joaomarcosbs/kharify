import { AppSidebar } from "@/components/app-sidebar"
import { CommandSearch } from "@/components/command-search"
import { Topbar } from "@/components/topbar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-background transition-colors duration-200">
          <Topbar />
          <CommandSearch />
          <main className="flex flex-1 flex-col w-full px-4 md:px-8 pb-8 pt-4 relative overflow-x-hidden">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
