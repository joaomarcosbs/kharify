import { api } from '@/lib/api'
import type { Organization } from '@/stores/organization-store'
import type { UserRole } from '@/types/enums'

export interface Member {
  id: string
  name: string
  email: string
  role: UserRole
  joinedAt: string
}

export const organizationService = {
  getActive: async (id: string): Promise<Organization> => {
    const response = await api.get<Organization>('/organizations/active', {
      headers: { 'X-Organization-Id': id },
    })
    return response.data
  },

  update: async (id: string, data: Partial<Pick<Organization, 'name' | 'type' | 'document'>>) => {
    const response = await api.patch<Organization>(`/organizations/${id}`, data)
    return response.data
  },

  getMembers: async (id: string): Promise<Member[]> => {
    const response = await api.get<Member[]>(`/organizations/${id}/members`)
    return Array.isArray(response.data) ? response.data : []
  },

  addMember: async (id: string, data: { name: string; email: string; document: string; password: string; role: UserRole }) => {
    const response = await api.post<Member>(`/organizations/${id}/members`, data)
    return response.data
  },
}
