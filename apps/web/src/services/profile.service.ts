import { api } from '@/lib/api'

export interface Profile {
  id: string
  name: string
  email: string
  phone?: string | null
  document?: string | null
  avatarUrl?: string | null
  provider: string
  createdAt: string
}

export interface UpdateProfile {
  name?: string
  email?: string
  phone?: string
  document?: string
  avatarUrl?: string
  currentPassword?: string
  newPassword?: string
}

export const profileService = {
  get: async () => (await api.get<Profile>('/profile')).data,
  update: async (data: UpdateProfile) => (await api.patch<Profile>('/profile', data)).data,
}
