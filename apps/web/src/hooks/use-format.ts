import { usePrivacyStore } from "@/stores/privacy-store"
import { formatCurrency as rawFormatCurrency } from "@/lib/format"
import { useState, useEffect } from "react"

/**
 * Hook que retorna formatCurrency respeitando o estado de privacidade.
 * Espera o componente montar antes de ocultar valores para evitar hydration mismatch.
 */
export function useFormat() {
  const hideBalances = usePrivacyStore((state) => state.hideBalances)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const formatCurrency = (value: number): string => {
    if (mounted && hideBalances) return "R$ ****"
    return rawFormatCurrency(value)
  }

  return { formatCurrency }
}
