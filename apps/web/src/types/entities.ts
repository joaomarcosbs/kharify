import type {
  AuthProvider,
  OrganizationType,
  UserRole,
  AccountType,
  CategoryKind,
  CategoryGroupType,
  CostCenterType,
  BillType,
  BillStatus,
  BillRecurrence,
  TransactionType,
  TransactionOrigin,
  DebtStatus,
  SimulationType,
} from './enums'

// ============================================
// ENTITIES — Espelham os retornos da API NestJS
// ============================================

export interface User {
  id: string
  name: string
  email: string
  provider: AuthProvider
  googleId?: string | null
  facebookId?: string | null
  appleId?: string | null
  createdAt: string
}

export interface Organization {
  id: string
  name: string
  type: OrganizationType
  createdAt: string
}

export interface UserOrganizationRole {
  userId: string
  organizationId: string
  role: UserRole
}

export interface Account {
  id: string
  organizationId: string
  name: string
  type: AccountType
  initialBalance: number
  initialBalanceDate: string
  runtimeBalance?: number
  createdAt: string
}

export interface Category {
  id: string
  organizationId: string
  name: string
  kind: CategoryKind
  groupType: CategoryGroupType
  createdAt: string
}

export interface CostCenter {
  id: string
  organizationId: string
  name: string
  type: CostCenterType
  createdAt: string
}

export interface Bill {
  id: string
  organizationId: string
  type: BillType
  accountId?: string | null
  categoryId?: string | null
  costCenterId?: string | null
  amount: number
  dueDate: string
  status: BillStatus
  recurrence: BillRecurrence
  description?: string | null
  createdAt: string
  updatedAt: string
  // Relações expandidas (quando incluídas pelo service)
  account?: Account | null
  category?: Category | null
  costCenter?: CostCenter | null
}

export interface Transaction {
  id: string
  organizationId: string
  type: TransactionType
  accountId: string
  accountIdDest?: string | null
  categoryId?: string | null
  costCenterId?: string | null
  billId?: string | null
  debtId?: string | null
  amount: number
  date: string
  description?: string | null
  origin: TransactionOrigin
  createdAt: string
  // Relações expandidas
  account?: Account | null
  accountDest?: Account | null
  category?: Category | null
  costCenter?: CostCenter | null
}

export interface Debt {
  id: string
  organizationId: string
  name: string
  accountId?: string | null
  originalAmount: number
  interestRateMonth?: number | null
  totalInstallments?: number | null
  installmentAmount?: number | null
  startDate: string
  status: DebtStatus
  currentBalance: number
  createdAt: string
  updatedAt: string
  // Relação expandida
  account?: Account | null
}

export interface AmortizationRow {
  monthIndex: number
  paymentAmount: number
  interestPaid: number
  principalPaid: number
  remainingBalance: number
}

export interface SimulationResult {
  simulationType: SimulationType
  rows: AmortizationRow[]
  totalPaid: number
  totalInterest: number
  months: number
}
