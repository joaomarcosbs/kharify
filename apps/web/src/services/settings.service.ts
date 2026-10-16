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

export interface UserSubscription {
  id: string
  planName: string
  status: "active" | "past_due" | "canceled"
  membersUsed: number
  membersQuota: number
  transactionsQuota?: number
  nextBillingDate: string
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

const mockSubscription: UserSubscription = {
  id: "sub-1",
  planName: "Kharify Gestor",
  status: "active",
  membersUsed: 3,
  membersQuota: 5,
  nextBillingDate: "2026-05-15T00:00:00Z",
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

  getSubscription: async (): Promise<UserSubscription> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return mockSubscription
  },
}
