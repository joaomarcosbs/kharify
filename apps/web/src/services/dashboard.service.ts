import { api } from '@/lib/api';

export interface DashboardSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  pendingBillsTotal: number;
  pendingBillsCount: number;
  totalDebtBalance: number;
  healthScore: number;
}

export interface MonthlyCashflowItem {
  month: string;
  income: number;
  expense: number;
}

export interface CategoryBreakdownItem {
  categoryId: string;
  name: string;
  amount: number;
  kind: string;
  groupType: string;
}

export interface CostCenterBreakdownItem {
  costCenterId: string;
  name: string;
  amount: number;
  type: string;
}

// NestJS TransformInterceptor wraps every response in { data: <actual payload> }.
// This helper unwraps it transparently.
function unwrap<T>(responseData: unknown): T | null {
  if (!responseData) return null;
  const d = responseData as Record<string, unknown>;
  return (d.data !== undefined ? d.data : responseData) as T;
}

export const dashboardService = {
  getSummary: async (): Promise<DashboardSummary> => {
    try {
      const resp = await api.get('/dashboard/summary');
      const raw = unwrap<DashboardSummary>(resp.data);
      if (raw) {
        return {
          totalBalance: Number(raw.totalBalance) || 0,
          monthlyIncome: Number(raw.monthlyIncome) || 0,
          monthlyExpense: Number(raw.monthlyExpense) || 0,
          pendingBillsTotal: Number(raw.pendingBillsTotal) || 0,
          pendingBillsCount: Number(raw.pendingBillsCount) || 0,
          totalDebtBalance: Number(raw.totalDebtBalance) || 0,
          healthScore: raw.healthScore != null ? Number(raw.healthScore) : 75,
        };
      }
    } catch {
      // Fallback
    }
    return {
      totalBalance: 0,
      monthlyIncome: 0,
      monthlyExpense: 0,
      pendingBillsTotal: 0,
      pendingBillsCount: 0,
      totalDebtBalance: 0,
      healthScore: 75,
    };
  },

  getCashflowMonthly: async (): Promise<MonthlyCashflowItem[]> => {
    const resp = await api.get('/dashboard/cashflow-monthly');
    const raw = unwrap<MonthlyCashflowItem[]>(resp.data);
    return raw || []
  },

  getCategoryBreakdown: async (): Promise<CategoryBreakdownItem[]> => {
    const resp = await api.get('/dashboard/category-breakdown');
    const raw = unwrap<CategoryBreakdownItem[]>(resp.data);
    return raw || []
  },

  getCostCenterBreakdown: async (): Promise<CostCenterBreakdownItem[]> => {
    const resp = await api.get('/dashboard/cost-center-breakdown');
    const raw = unwrap<CostCenterBreakdownItem[]>(resp.data);
    return raw || []
  },
};
