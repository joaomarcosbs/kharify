import type { Category } from '@/types/entities'
import type { CreateCategoryDto, UpdateCategoryDto } from '@/types/dto'
import { api } from '@/lib/api'

export const categoriesService = {
  findAll: async (): Promise<Category[]> => {
    const resp = await api.get<Category[]>('/categories')
    return Array.isArray(resp.data) ? resp.data : []
  },

  findOne: async (id: string): Promise<Category> => {
    const resp = await api.get<Category>(`/categories/${id}`)
    return resp.data
  },

  create: async (dto: CreateCategoryDto): Promise<Category> => {
    const resp = await api.post<Category>('/categories', dto)
    return resp.data
  },

  update: async (id: string, dto: UpdateCategoryDto): Promise<Category> => {
    const resp = await api.patch<Category>(`/categories/${id}`, dto)
    return resp.data
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`)
  },
}
