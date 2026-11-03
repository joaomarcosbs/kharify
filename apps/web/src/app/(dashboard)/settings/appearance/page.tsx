"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"
import { Moon, Sun, Monitor, ArrowLeft } from "lucide-react"
import { usePrivacyStore } from "@/stores/privacy-store"
import Link from "next/link"
import { settingsService } from "@/services/settings.service"

const accentColors = [
  { name: "violet", label: "Violeta", value: "#8b5cf6" },
  { name: "blue", label: "Azul", value: "#3b82f6" },
  { name: "emerald", label: "Esmeralda", value: "#10b981" },
  { name: "amber", label: "Âmbar", value: "#f59e0b" },
  { name: "rose", label: "Rosa", value: "#f43f5e" },
  { name: "cyan", label: "Ciano", value: "#06b6d4" },
]

function applyAccent(name: string) {
  const color = accentColors.find((item) => item.name === name)?.value
  if (color && typeof document !== "undefined") {
    document.documentElement.style.setProperty("--primary", color)
    document.documentElement.style.setProperty("--ring", color)
  }
}

export default function AppearancePage() {
  const [mounted, setMounted] = useState(false)
  const [accent, setAccent] = useState("violet")
  const { theme, setTheme } = useTheme()
  const hideBalancesDefault = usePrivacyStore(state => state.hideBalances)
  const setHideBalances = usePrivacyStore(state => state.setHideBalances)

  useEffect(() => {
    setMounted(true)
    settingsService.getSettings().then((settings) => {
      setAccent(settings.accentColor)
      setHideBalances(settings.hideBalancesOnStartup)
      applyAccent(settings.accentColor)
    })
  }, [])

  const chooseAccent = (name: string) => {
    setAccent(name)
    applyAccent(name)
    void settingsService.updateSettings({ accentColor: name })
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 pb-12">
      <Link href="/settings" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-fit group">
        <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" /> Voltar para Configurações
      </Link>
      
      <PageHeader
        title="Aparência"
        description="Personalize o tema e comportamento visual da plataforma."
        breadcrumbs={[]}
      />

      {!mounted ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-muted-foreground animate-pulse">Carregando preferências...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          
          {/* Tema */}
          <div className="rounded-2xl border border-border/50 bg-background dark:bg-sidebar shadow-sm overflow-hidden p-6">
            <div className="mb-4">
              <h3 className="text-base font-semibold">Tema do Sistema</h3>
              <p className="text-[13px] text-muted-foreground mt-1">Reflete em todas as telas do seu painel.</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <button 
                onClick={() => setTheme("light")}
                className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/30'}`}
              >
                <Sun className="size-6 text-foreground" />
                <span className="text-sm font-medium">Claro</span>
              </button>
              <button 
                onClick={() => setTheme("dark")}
                className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/30'}`}
              >
                <Moon className="size-6 text-foreground" />
                <span className="text-sm font-medium">Escuro</span>
              </button>
              <button 
                onClick={() => setTheme("system")}
                className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === 'system' ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/30'}`}
              >
                <Monitor className="size-6 text-foreground" />
                <span className="text-sm font-medium">Auto (Sistema)</span>
              </button>
            </div>
          </div>

          {/* Privacidade */}
          <div className="rounded-2xl border border-border/50 bg-background dark:bg-sidebar shadow-sm overflow-hidden p-6 flex items-center justify-between">
            <div className="flex flex-col mr-4">
              <h3 className="text-base font-semibold">Ocultar saldos por padrão</h3>
              <p className="text-[13px] text-muted-foreground mt-1">Sempre esconde os valores sensíveis ao iniciar o sistema para garantir sua privacidade.</p>
            </div>
            <Switch checked={hideBalancesDefault} onCheckedChange={setHideBalances} />
          </div>

          {/* Cor de Destaque */}
          <div className="rounded-2xl border border-border/50 bg-background dark:bg-sidebar shadow-sm overflow-hidden p-6">
            <div className="mb-5">
              <h3 className="text-base font-semibold">Cor de Destaque</h3>
              <p className="text-[13px] text-muted-foreground mt-1">Personaliza botões, links e elementos de ação do seu painel.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {accentColors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => chooseAccent(color.name)}
                  className={`group relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all w-20 ${
                    accent === color.name
                      ? "border-foreground bg-foreground/5 scale-105"
                      : "border-border/50 hover:border-foreground/30"
                  }`}
                >
                  <div
                    className="size-8 rounded-full ring-2 ring-offset-2 ring-offset-background transition-all"
                    style={{ 
                      backgroundColor: color.value,
                      boxShadow: accent === color.name ? `0 0 0 2px ${color.value}` : "none"
                    }}
                  />
                  <span className="text-[11px] font-medium">{color.label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">A preferência fica salva neste dispositivo.</p>
          </div>
          
        </div>
      )}
    </div>
  )
}
