// ============================================
// ENUMS — Espelham os enums do schema.prisma
// ============================================

// Auth
export type AuthProvider = 'email' | 'google' | 'facebook' | 'apple'
export const AUTH_PROVIDERS: Record<AuthProvider, string> = {
  email: 'E-mail',
  google: 'Google',
  facebook: 'Facebook',
  apple: 'Apple',
}

// Organization
export type OrganizationType = 'pessoal' | 'empresarial'
export const ORGANIZATION_TYPES: Record<OrganizationType, string> = {
  pessoal: 'Pessoal',
  empresarial: 'Empresarial',
}

// User
export type UserRole = 'owner' | 'gestor' | 'membro'
export const USER_ROLES: Record<UserRole, string> = {
  owner: 'Proprietário',
  gestor: 'Gestor',
  membro: 'Membro',
}

// Account
export type AccountType = 'conta' | 'carteira' | 'cartao' | 'corretora'
export const ACCOUNT_TYPES: Record<AccountType, string> = {
  conta: 'Conta Bancária',
  carteira: 'Carteira',
  cartao: 'Cartão',
  corretora: 'Corretora',
}

// Category
export type CategoryKind = 'receita' | 'despesa'
export const CATEGORY_KINDS: Record<CategoryKind, string> = {
  receita: 'Receita',
  despesa: 'Despesa',
}

export type CategoryGroupType = 'essencial' | 'necessario' | 'superfluo'
export const CATEGORY_GROUP_TYPES: Record<CategoryGroupType, string> = {
  essencial: 'Essencial',
  necessario: 'Necessário',
  superfluo: 'Supérfluo',
}

// Cost Center
export type CostCenterType = 'pessoa' | 'projeto' | 'area'
export const COST_CENTER_TYPES: Record<CostCenterType, string> = {
  pessoa: 'Pessoa',
  projeto: 'Projeto',
  area: 'Área',
}

// Bill
export type BillType = 'pagar' | 'receber'
export const BILL_TYPES: Record<BillType, string> = {
  pagar: 'A Pagar',
  receber: 'A Receber',
}

export type BillStatus = 'aberta' | 'parcial' | 'paga' | 'atrasada'
export const BILL_STATUSES: Record<BillStatus, string> = {
  aberta: 'Aberta',
  parcial: 'Parcial',
  paga: 'Paga',
  atrasada: 'Atrasada',
}

export type BillRecurrence = 'nenhuma' | 'mensal' | 'anual'
export const BILL_RECURRENCES: Record<BillRecurrence, string> = {
  nenhuma: 'Nenhuma',
  mensal: 'Mensal',
  anual: 'Anual',
}

// Transaction
export type TransactionType = 'entrada' | 'saida' | 'transferencia'
export const TRANSACTION_TYPES: Record<TransactionType, string> = {
  entrada: 'Entrada',
  saida: 'Saída',
  transferencia: 'Transferência',
}

export type TransactionOrigin = 'manual' | 'open_finance' | 'recorrente'
export const TRANSACTION_ORIGINS: Record<TransactionOrigin, string> = {
  manual: 'Manual',
  open_finance: 'Open Finance',
  recorrente: 'Recorrente',
}

// Debt
export type DebtStatus = 'ativa' | 'quitada'
export const DEBT_STATUSES: Record<DebtStatus, string> = {
  ativa: 'Ativa',
  quitada: 'Quitada',
}

// Simulation
export type SimulationType = 'price' | 'sac'
export const SIMULATION_TYPES: Record<SimulationType, string> = {
  price: 'Tabela Price',
  sac: 'SAC',
}
