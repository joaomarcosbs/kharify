import { create } from "zustand"
import { persist } from "zustand/middleware"

interface PrivacyState {
  hideBalances: boolean
  toggleHideBalances: () => void
  setHideBalances: (value: boolean) => void
}

export const usePrivacyStore = create<PrivacyState>()(
  persist(
    (set) => ({
      hideBalances: false,
      toggleHideBalances: () => set((state) => ({ hideBalances: !state.hideBalances })),
      setHideBalances: (value) => set({ hideBalances: value }),
    }),
    {
      name: "kharify:hideBalances",
    }
  )
)
