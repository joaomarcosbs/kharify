import type { Category } from '@/types/entities'

export const mockCategories: Category[] = [
  // Receitas
  {
    id: 'cat-001',
    organizationId: 'org-001',
    name: 'Salário',
    kind: 'receita',
    groupType: 'essencial',
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cat-002',
    organizationId: 'org-001',
    name: 'Freelance',
    kind: 'receita',
    groupType: 'essencial',
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cat-003',
    organizationId: 'org-001',
    name: 'Rendimentos',
    kind: 'receita',
    groupType: 'essencial',
    createdAt: '2025-01-01T00:00:00Z',
  },
  // Despesas — Essencial
  {
    id: 'cat-004',
    organizationId: 'org-001',
    name: 'Aluguel',
    kind: 'despesa',
    groupType: 'essencial',
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cat-005',
    organizationId: 'org-001',
    name: 'Alimentação',
    kind: 'despesa',
    groupType: 'essencial',
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cat-006',
    organizationId: 'org-001',
    name: 'Transporte',
    kind: 'despesa',
    groupType: 'essencial',
    createdAt: '2025-01-01T00:00:00Z',
  },
  // Despesas — Necessário
  {
    id: 'cat-007',
    organizationId: 'org-001',
    name: 'Saúde',
    kind: 'despesa',
    groupType: 'necessario',
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cat-008',
    organizationId: 'org-001',
    name: 'Educação',
    kind: 'despesa',
    groupType: 'necessario',
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cat-009',
    organizationId: 'org-001',
    name: 'Seguro',
    kind: 'despesa',
    groupType: 'necessario',
    createdAt: '2025-01-01T00:00:00Z',
  },
  // Despesas — Supérfluo
  {
    id: 'cat-010',
    organizationId: 'org-001',
    name: 'Netflix',
    kind: 'despesa',
    groupType: 'superfluo',
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cat-011',
    organizationId: 'org-001',
    name: 'Lazer',
    kind: 'despesa',
    groupType: 'superfluo',
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cat-012',
    organizationId: 'org-001',
    name: 'Vestuário',
    kind: 'despesa',
    groupType: 'superfluo',
    createdAt: '2025-01-01T00:00:00Z',
  },
]
