"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative flex items-center justify-center shrink-0 size-8 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
    >
      <Sun className="h-5 w-5 dark:-rotate-90 dark:scale-0 transition-all duration-300" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 dark:rotate-0 dark:scale-100 transition-all duration-300" />
      <span className="sr-only">Trocar tema</span>
    </button>
  )
}
