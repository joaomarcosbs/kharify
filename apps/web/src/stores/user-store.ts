import { create } from "zustand"

interface User {
  id: string
  name: string
  email: string
  role: string
  avatarUrl?: string
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
      const res = await fetch("/api/auth/me")
      if (!res.ok) throw new Error("Falha ao buscar dados do usuário")
      const data = await res.json()
      set({ user: data, isLoading: false })
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
