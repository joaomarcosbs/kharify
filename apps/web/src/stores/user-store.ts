import { create } from "zustand"
import { profileService } from "@/services/profile.service"

interface User {
  id: string
  name: string
  email: string
  role?: string
  avatarUrl?: string | null
}

interface UserState {
  user: User | null
  isLoading: boolean
  error: string | null

  fetchUser: () => Promise<void>
  setUser: (user: User) => void
  clearUser: () => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  fetchUser: async () => {
    set({ isLoading: true, error: null })
    try {
      const profile = await profileService.get()
      set({
        user: {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          avatarUrl: profile.avatarUrl,
        },
        isLoading: false,
      })
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Erro desconhecido",
        isLoading: false,
      })
    }
  },

  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}))
