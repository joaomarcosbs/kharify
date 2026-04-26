"use client"

import { Bell, Search, Eye, EyeOff } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { useEffect, useState } from "react"
import { usePrivacyStore } from "@/stores/privacy-store"

export function Topbar() {
  const [mounted, setMounted] = useState(false)
  const [isMac, setIsMac] = useState(false)
  const hideBalances = usePrivacyStore((state) => state.hideBalances)
  const toggleHideBalances = usePrivacyStore((state) => state.toggleHideBalances)
  const showHidden = mounted && hideBalances

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().includes("MAC"))
    setMounted(true)
  }, [])

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
            <span className="text-base font-semibold leading-none mb-1 text-foreground">Olá, João</span>
            <span className="text-sm text-muted-foreground leading-none mt-0.5">Bem-vindo ao seu painel</span>
          </div>
        </div>

        {/* Middle/Right side: Search and Icons */}
        <div className="flex items-center gap-6">

          {/* Search Box — trigger para Command Palette */}
          <button
            className="relative hidden sm:flex items-center bg-muted/60 rounded-md px-3 h-[36px] w-[280px] border border-border/50 hover:border-primary/50 transition-all cursor-pointer group"
            onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
          >
            <Search className="size-4 text-muted-foreground shrink-0" />
            <span className="px-2 text-sm text-muted-foreground/70">Buscar...</span>
            <span className="ml-auto flex items-center gap-0.5 text-xs text-muted-foreground/50 font-mono">
              <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border/50 text-[10px] font-semibold">
                {isMac ? "⌘" : "Ctrl"}
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border/50 text-[10px] font-semibold">
                K
              </kbd>
            </span>
          </button>

          {/* Action Icons */}
          <div className="flex items-center gap-3 text-muted-foreground/80">
            <button
              onClick={toggleHideBalances}
              className="hover:text-foreground transition-colors shrink-0 flex items-center justify-center p-1.5 rounded-md hover:bg-muted"
            >
              {showHidden ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
            <ThemeToggle />
            {/* Notification Bell with red dot indicator */}
            <button className="relative hover:text-foreground transition-colors shrink-0 border-l border-border/60 pl-3 ml-1 h-6 flex items-center justify-center pt-0">
              <Bell className="size-5 ml-2" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background translate-x-1 -translate-y-0.5"></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
