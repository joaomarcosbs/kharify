import { create } from "zustand"

interface Metric {
  title: string
  value: string
  trend: string
  trendDirection: "up" | "down" | "neutral"
}

interface DashboardState {
  metrics: Metric[]
  isLoading: boolean
  error: string | null
  selectedPeriod: "day" | "week" | "month" | "year"

  fetchMetrics: () => Promise<void>
  setSelectedPeriod: (period: DashboardState["selectedPeriod"]) => void
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  metrics: [],
  isLoading: false,
  error: null,
  selectedPeriod: "week",

  fetchMetrics: async () => {
    const { selectedPeriod } = get()
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/dashboard/metrics?period=${selectedPeriod}`)
      if (!res.ok) throw new Error("Falha ao buscar métricas")
      const data = await res.json()
      set({ metrics: data, isLoading: false })
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Erro desconhecido",
        isLoading: false,
      })
    }
  },

  setSelectedPeriod: (period) => {
    set({ selectedPeriod: period })
    // Auto-fetch when period changes
    get().fetchMetrics()
  },
}))
