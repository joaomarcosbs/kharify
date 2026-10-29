import type {
  OrganizationType,
  AccountType,
  CategoryKind,
  CategoryGroupType,
  BillType,
  BillStatus,
  BillRecurrence,
  TransactionType,
  TransactionOrigin,
  DebtStatus,
  SimulationType,
} from './enums'

// ============================================
// DTOs — Request/Response espelhando os DTOs da API NestJS
// ============================================

// --- Auth ---

export interface LoginDto {
  email: string
  password: string
}

export interface SocialLoginDto {
  provider: 'google' | 'facebook' | 'apple'
  providerId: string
  email: string
  name: string
}

export interface RegisterDto {
  name: string
  email: string
  password: string
  organizationName: string
  organizationType: OrganizationType
}

export interface LoginResponseDto {
  access_token: string
  user: {
    id: string
    email: string
  }
  organizationId: string
}

// --- Account ---

export interface CreateAccountDto {
  name: string
  type: AccountType
  initialBalance: number
  initialBalanceDate: string
}

export interface UpdateAccountDto {
  name?: string
  type?: AccountType
}

// --- Category ---

export interface CreateCategoryDto {
  name: string
  kind: CategoryKind
  groupType: CategoryGroupType
}

export interface UpdateCategoryDto {
  name?: string
  kind?: CategoryKind
  groupType?: CategoryGroupType
}

// --- Bill ---

export interface CreateBillDto {
  type: BillType
  accountId?: string
  categoryId?: string
  costCenterId?: string
  amount: number
  dueDate: string
  status?: BillStatus
  recurrence?: BillRecurrence
  description?: string
}

export interface UpdateBillDto {
  type?: BillType
  accountId?: string
  categoryId?: string
  costCenterId?: string
  amount?: number
  dueDate?: string
  status?: BillStatus
  recurrence?: BillRecurrence
  description?: string
}

// --- Transaction ---

export interface CreateTransactionDto {
  type: TransactionType
  accountId: string
  accountIdDest?: string
  categoryId?: string
  costCenterId?: string
  billId?: string
  debtId?: string
  amount: number
  date: string
  description?: string
  origin?: TransactionOrigin
}

// --- Debt ---

export interface CreateDebtDto {
  name: string
  accountId?: string
  originalAmount: number
  interestRateMonth?: number
  totalInstallments?: number
  installmentAmount?: number
  startDate: string
  status: DebtStatus
}

export interface SimulateDebtDto {
  simulationType: SimulationType
  simulationMode: 'extraPayment' | 'targetMonths'
  extraPaymentAmount?: number
  targetMonths?: number
}

// --- API Response Wrapper (conforme blueprint) ---

export interface ApiError {
  statusCode: number
  message: string
  error?: string
}

export interface ApiResponse<T> {
  data: T | null
  meta?: Record<string, unknown>
  error: ApiError | null
}
