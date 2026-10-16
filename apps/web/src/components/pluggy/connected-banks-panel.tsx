"use client"

import { useState, useEffect, useCallback } from "react"
import { PluggyItem } from "@/types/entities"
import { pluggyService } from "@/services/pluggy.service"
import { Button } from "@/components/ui/button"
import { Landmark, RefreshCw, Trash2, CheckCircle, AlertCircle, Clock } from "lucide-react"

interface ConnectedBanksPanelProps {
  onRefreshNeeded?: () => void
}

export function ConnectedBanksPanel({ onRefreshNeeded }: ConnectedBanksPanelProps) {
  const [items, setItems] = useState<PluggyItem[]>([])
  const [syncingId, setSyncingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadItems = useCallback(async () => {
    try {
      const list = await pluggyService.getItems()
      setItems(Array.isArray(list) ? list : [])
    } catch (err) {
      console.error("Failed to load connected banks:", err)
      setItems([])
    }
  }, [])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  const handleSync = async (id: string) => {
    setSyncingId(id)
    try {
      await pluggyService.syncItem(id)
      await loadItems()
      onRefreshNeeded?.()
    } catch (err) {
      console.error("Manual sync failed:", err)
    } finally {
      setSyncingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja desconectar esta instituição bancária?")) return
    setDeletingId(id)
    try {
      await pluggyService.deleteItem(id)
      await loadItems()
      onRefreshNeeded?.()
    } catch (err) {
      console.error("Delete item failed:", err)
    } finally {
      setDeletingId(null)
    }
  }

  const safeItems = Array.isArray(items) ? items : []

  if (safeItems.length === 0) {
    return null
  }

  return (
    <div className="rounded-[24px] border border-border/40 bg-background/50 dark:bg-sidebar/50 p-6 shadow-xs backdrop-blur">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Landmark className="size-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Conexões Open Finance</h3>
            <p className="text-xs text-muted-foreground">Instituições bancárias integradas via Pluggy</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {safeItems.map((item) => {
          const isSyncing = syncingId === item.id
          const isDeleting = deletingId === item.id
          const hasError = item.status === "SYNC_ERROR" || item.status === "LOGIN_ERROR"

          return (
            <div
              key={item.id}
              className="flex flex-col justify-between p-4 rounded-2xl border border-border/60 bg-background dark:bg-sidebar shadow-xs hover:border-primary/30 transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h4 className="font-medium text-sm text-foreground">{item.connectorName}</h4>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                    <Clock className="size-3" />
                    <span>
                      {new Date(item.lastSyncedAt).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <div
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    hasError
                      ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                      : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  }`}
                >
                  {hasError ? (
                    <>
                      <AlertCircle className="size-2.5" />
                      <span>Erro</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="size-2.5" />
                      <span>Ativo</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/40 mt-auto">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={isSyncing || isDeleting}
                  onClick={() => handleSync(item.id)}
                  className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5 rounded-xl cursor-pointer"
                >
                  <RefreshCw className={`size-3.5 ${isSyncing ? "animate-spin text-primary" : ""}`} />
                  <span>{isSyncing ? "Sincronizando..." : "Sincronizar"}</span>
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  disabled={isDeleting || isSyncing}
                  onClick={() => handleDelete(item.id)}
                  className="h-8 px-2.5 text-xs text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 gap-1.5 rounded-xl cursor-pointer"
                >
                  <Trash2 className="size-3.5" />
                  <span>Desconectar</span>
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
