import type { Category } from '@/types/entities'
import type { CreateCategoryDto, UpdateCategoryDto } from '@/types/dto'
import { mockCategories } from '@/mocks/categories'

let categories = [...mockCategories]

export const categoriesService = {
  findAll: async (): Promise<Category[]> => {
    return [...categories]
  },

  findOne: async (id: string): Promise<Category> => {
    const category = categories.find((c) => c.id === id)
    if (!category) throw new Error('Categoria não encontrada')
    return { ...category }
  },

  create: async (dto: CreateCategoryDto): Promise<Category> => {
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      organizationId: 'org-001',
      name: dto.name,
      kind: dto.kind,
      groupType: dto.groupType,
      createdAt: new Date().toISOString(),
    }
    categories.push(newCategory)
    return newCategory
  },

  update: async (id: string, dto: UpdateCategoryDto): Promise<Category> => {
    const index = categories.findIndex((c) => c.id === id)
    if (index === -1) throw new Error('Categoria não encontrada')
    categories[index] = { ...categories[index], ...dto }
    return { ...categories[index] }
  },

  remove: async (id: string): Promise<void> => {
    categories = categories.filter((c) => c.id !== id)
  },
}
