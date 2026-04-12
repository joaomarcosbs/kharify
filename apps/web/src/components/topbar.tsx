"use client"

import { Activity, Bell, Languages, Search } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"

export function Topbar() {
  return (
    <header
      className="sticky top-0 z-50 flex h-16 w-full shrink-0 px-4 md:px-8 bg-background/80 backdrop-blur-md"
      style={{ transition: "background-color 200ms ease, width 200ms linear, height 200ms linear" }}
    >
      <div className="mx-auto flex h-full w-full max-w-[1400px] items-center justify-between gap-4">
        {/* Left side: Trigger and Greeting */}
        <div className="flex items-center gap-4">
          <SidebarTrigger className="-ml-2 text-muted-foreground hover:text-foreground" />
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-semibold leading-none mb-1 text-foreground">Hey, John</span>
            <span className="text-xs text-muted-foreground leading-none">Welcome back to dashboard</span>
          </div>
        </div>

        {/* Middle/Right side: Search and Icons */}
        <div className="flex items-center gap-6">

          {/* Search Box */}
          <div className="relative hidden sm:flex items-center bg-muted/60 rounded-md px-3 h-[36px] w-[280px] border border-border/50 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all group overflow-hidden">
            <Search className="size-4 text-muted-foreground shrink-0" />
            <input
              type="search"
              placeholder="Type to search..."
              className="bg-transparent border-0 outline-none h-full w-full px-2 text-sm placeholder:text-muted-foreground/70"
            />
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-3 text-muted-foreground/80">
            <button className="hover:text-foreground transition-colors shrink-0 size-8 flex items-center justify-center rounded-full hover:bg-muted">
              <Languages className="size-5" />
            </button>
            <ThemeToggle />
            <button className="hover:text-foreground transition-colors shrink-0 size-8 flex items-center justify-center rounded-full hover:bg-muted">
              <Activity className="size-5" />
            </button>
            {/* Notification Bell with red dot indicator */}
            <button className="relative hover:text-foreground transition-colors shrink-0 border-l border-border/60 pl-3 ml-1 h-6 flex items-center justify-center">
              <Bell className="size-5 ml-2" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background translate-x-1 -translate-y-0.5"></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
