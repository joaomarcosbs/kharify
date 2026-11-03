import { api } from '@/lib/api';
import type { PluggyItem } from '@/types/entities';

type ApiPayload = Record<string, unknown>;

export interface ConnectTokenResponse {
  accessToken: string;
  sandbox?: boolean;
}

export interface RegisterItemDto {
  itemId: string;
  connectorId?: number;
  connectorName?: string;
}

export interface SyncResponse {
  success: boolean;
  syncedAccounts: number;
  syncedTransactions: number;
  sandbox?: boolean;
}

export const pluggyService = {
  createConnectToken: async (): Promise<ConnectTokenResponse> => {
    try {
      const resp = await api.post<ApiPayload>('/pluggy/connect-token');
      const data = (resp.data.data ?? resp.data) as Partial<ConnectTokenResponse>;
      if (data.accessToken) return data as ConnectTokenResponse;
    } catch {
      // Fallback for offline / dev mock mode
    }
    return {
      accessToken: `mock-token-${Date.now()}`,
      sandbox: true,
    };
  },

  registerItem: async (dto: RegisterItemDto): Promise<PluggyItem> => {
    const resp = await api.post<ApiPayload>('/pluggy/items', dto);
    return (resp.data.data ?? resp.data) as PluggyItem;
  },

  getItems: async (): Promise<PluggyItem[]> => {
    try {
      const resp = await api.get<ApiPayload | PluggyItem[]>('/pluggy/items');
      const raw = resp.data;
      if (Array.isArray(raw)) return raw;
      if (raw && !Array.isArray(raw) && Array.isArray(raw.data)) return raw.data as PluggyItem[];
      return [];
    } catch {
      return [];
    }
  },

  syncItem: async (id: string): Promise<SyncResponse> => {
    const resp = await api.post<ApiPayload>(`/pluggy/items/${id}/sync`);
    return (resp.data.data ?? resp.data) as SyncResponse;
  },

  deleteItem: async (id: string): Promise<{ message: string }> => {
    const resp = await api.delete<ApiPayload>(`/pluggy/items/${id}`);
    return (resp.data.data ?? resp.data) as { message: string };
  },
};
