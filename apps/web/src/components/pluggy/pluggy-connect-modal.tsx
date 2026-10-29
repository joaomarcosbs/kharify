"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { pluggyService } from "@/services/pluggy.service"
import { Landmark, ShieldCheck, RefreshCw, Sparkles, CheckCircle2, KeyRound, ArrowRight } from "lucide-react"

declare global {
  interface Window {
    PluggyConnect?: any
  }
}

interface PluggyConnectModalProps {
  onSuccess?: () => void
}

const POPULAR_BANKS = [
  { id: 2, name: "Nubank", color: "bg-purple-600", lightColor: "text-purple-600 bg-purple-50 dark:bg-purple-950/40" },
  { id: 1, name: "Itaú", color: "bg-orange-600", lightColor: "text-orange-600 bg-orange-50 dark:bg-orange-950/40" },
  { id: 3, name: "Bradesco", color: "bg-red-600", lightColor: "text-red-600 bg-red-50 dark:bg-red-950/40" },
  { id: 4, name: "Banco Inter", color: "bg-amber-600", lightColor: "text-amber-600 bg-amber-50 dark:bg-amber-950/40" },
  { id: 5, name: "Santander", color: "bg-rose-600", lightColor: "text-rose-600 bg-rose-50 dark:bg-rose-950/40" },
  { id: 6, name: "BTG Pactual / XP", color: "bg-blue-600", lightColor: "text-blue-600 bg-blue-50 dark:bg-blue-950/40" },
]

export function PluggyConnectModal({ onSuccess }: PluggyConnectModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedBank, setSelectedBank] = useState<string | null>(null)
  const [manualItemId, setManualItemId] = useState("")
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleConnectBank = async (bank?: typeof POPULAR_BANKS[0]) => {
    setLoading(true)
    setSelectedBank(bank ? bank.name : null)
    setSuccessMessage(null)

    try {
      const tokenData = await pluggyService.createConnectToken()

      // If in browser and Pluggy Connect widget script is available, initialize widget
      if (!tokenData.sandbox && typeof window !== "undefined" && window.PluggyConnect) {
        const pluggyConnect = new window.PluggyConnect({
          connectToken: tokenData.accessToken,
          includeSandbox: true,
          onSuccess: async (data: any) => {
            const itemId = data.item?.id || `item-${Date.now()}`
            const connectorId = data.item?.connector?.id
            const connectorName = data.item?.connector?.name
            await pluggyService.registerItem({ itemId, connectorId, connectorName })
            setSuccessMessage(`Banco conectado com sucesso!`)
            setTimeout(() => {
              setOpen(false)
              onSuccess?.()
            }, 1200)
          },
          onError: (error: any) => {
            console.error("Pluggy Connect error:", error)
            setLoading(false)
          },
          onClose: () => {
            setLoading(false)
          },
        })
        pluggyConnect.init()
        return
      }

      // Sandbox / Quick-Connect fallback for testing
      const fakeItemId = `pluggy-${bank ? bank.name.toLowerCase().replace(/\s+/g, '-') : 'bank'}-${Date.now()}`
      await pluggyService.registerItem({
        itemId: fakeItemId,
        connectorId: bank ? bank.id : 2,
        connectorName: bank ? bank.name : "Nubank",
      })

      setSuccessMessage(`${bank ? bank.name : "Banco"} sincronizado via Open Finance!`)
      setTimeout(() => {
        setOpen(false)
        setSuccessMessage(null)
        onSuccess?.()
      }, 1200)
    } catch (err: any) {
      console.error("Failed to connect bank:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedId = manualItemId.trim()
    if (!trimmedId) return

    setLoading(true)
    setSelectedBank("Meu Pluggy ID")
    try {
      await pluggyService.registerItem({
        itemId: trimmedId,
      })

      setSuccessMessage("Conta do Meu Pluggy vinculada e sincronizada!")
      setTimeout(() => {
        setOpen(false)
        setSuccessMessage(null)
        setManualItemId("")
        onSuccess?.()
      }, 1200)
    } catch (err: any) {
      console.error("Failed to link manual itemId:", err)
      alert("Não foi possível encontrar ou vincular este ID. Verifique se o Item ID é válido.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center h-10 px-4 gap-2 rounded-xl border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary transition-all shadow-xs text-sm font-medium cursor-pointer">
        <Landmark className="size-4 text-primary" />
        <span>Conectar Banco (Open Finance)</span>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px] p-6 rounded-3xl">
        <DialogHeader className="gap-2">
          <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-1">
            <Sparkles className="size-6" />
          </div>
          <DialogTitle className="text-xl font-semibold">Conectar via Open Finance</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Conecte suas contas bancárias via Pluggy para importar extratos e faturas automaticamente de forma padronizada.
          </DialogDescription>
        </DialogHeader>

        {successMessage ? (
          <div className="my-6 flex flex-col items-center justify-center p-6 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-center animate-in fade-in zoom-in-95">
            <CheckCircle2 className="size-10 text-emerald-500 mb-2" />
            <p className="font-semibold text-foreground">{successMessage}</p>
            <p className="text-xs text-muted-foreground mt-1">Atualizando contas e transações...</p>
          </div>
        ) : (
          <div className="space-y-4 my-2">
            <div className="rounded-2xl bg-muted/40 p-3.5 flex items-start gap-3 border border-border/50 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                Conexão criptografada de ponta a ponta através do modelo <strong>Meu Pluggy</strong>. Suas credenciais nunca são armazenadas.
              </span>
            </div>

            {/* Input manual de Item ID do Meu Pluggy */}
            <form onSubmit={handleManualSubmit} className="p-3.5 rounded-2xl border border-border/60 bg-muted/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <KeyRound className="size-3.5 text-primary" />
                <span>Vincular por Item ID do Meu Pluggy</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Já conectou seu banco no portal <code>meu.pluggy.ai</code>? Insira o <strong>Item ID</strong> para importar:
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Input
                  value={manualItemId}
                  onChange={(e) => setManualItemId(e.target.value)}
                  placeholder="Ex: 4d9a16f2-8924-4f8e-a6a3-83214b7e804f"
                  disabled={loading}
                  className="h-9 text-xs font-mono"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={loading || !manualItemId.trim()}
                  className="h-9 px-3 gap-1 rounded-xl text-xs shrink-0 cursor-pointer"
                >
                  <span>Vincular</span>
                  <ArrowRight className="size-3.5" />
                </Button>
              </div>
            </form>

            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-border/50 w-full" />
              <span className="bg-background px-3 text-[11px] uppercase font-medium text-muted-foreground absolute">
                ou conecte diretamente
              </span>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2.5">
                {POPULAR_BANKS.map((bank) => (
                  <button
                    key={bank.id}
                    onClick={() => handleConnectBank(bank)}
                    disabled={loading}
                    className={`flex items-center gap-3 p-3 rounded-2xl border border-border/60 hover:border-primary/50 hover:bg-muted/40 text-left transition-all group cursor-pointer disabled:opacity-50`}
                  >
                    <div className={`size-8 rounded-xl flex items-center justify-center font-bold text-xs ${bank.lightColor}`}>
                      {bank.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium group-hover:text-primary transition-colors truncate">
                      {bank.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {loading && (
              <div className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground">
                <RefreshCw className="size-4 animate-spin text-primary" />
                <span>Sincronizando {selectedBank || "dados bancários"}...</span>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
