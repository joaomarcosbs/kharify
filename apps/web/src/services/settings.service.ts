export interface UserSettings {
  id: string
  theme: "light" | "dark" | "system"
  density: "comfortable" | "compact"
  hideBalancesOnStartup: boolean
  baseCurrency: "BRL" | "USD" | "EUR"
  cycleStartDay: number
  lowBalanceAlert: boolean
  debtAlert: boolean
  weeklyDigest: boolean
  accentColor: string
}

const defaultSettings: UserSettings = {
  id: "stg-1",
  theme: "system",
  density: "comfortable",
  hideBalancesOnStartup: true,
  baseCurrency: "BRL",
  cycleStartDay: 1,
  lowBalanceAlert: true,
  debtAlert: true,
  weeklyDigest: false,
  accentColor: "green",
}

export const settingsService = {
  getSettings: async (): Promise<UserSettings> => {
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem('kharify_settings')
        if (raw) return JSON.parse(raw)
      }
    } catch {}
    return defaultSettings
  },

  updateSettings: async (updates: Partial<UserSettings>): Promise<UserSettings> => {
    const current = await settingsService.getSettings()
    const next = { ...current, ...updates }
    if (typeof window !== "undefined") {
      localStorage.setItem('kharify_settings', JSON.stringify(next))
    }
    return next
  },
}
