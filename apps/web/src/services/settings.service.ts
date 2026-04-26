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

const mockSettings: UserSettings = {
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
    // Simulando chamada de API
    await new Promise((resolve) => setTimeout(resolve, 300))
    return mockSettings
  },

  updateSettings: async (updates: Partial<UserSettings>): Promise<UserSettings> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    Object.assign(mockSettings, updates)
    return mockSettings
  },

  getSubscription: async (): Promise<UserSubscription> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return mockSubscription
  },
}
