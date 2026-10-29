import { create } from 'zustand';

interface LoadingState {
  isLoading: boolean;
  loadingText: string | null;
  activeRequests: number;

  startLoading: (message?: string) => void;
  stopLoading: () => void;
  setLoading: (loading: boolean, message?: string) => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  loadingText: null,
  activeRequests: 0,

  startLoading: (message) =>
    set((state) => {
      const nextCount = state.activeRequests + 1;
      return {
        activeRequests: nextCount,
        isLoading: true,
        loadingText: message || state.loadingText || 'Carregando...',
      };
    }),

  stopLoading: () =>
    set((state) => {
      const nextCount = Math.max(0, state.activeRequests - 1);
      return {
        activeRequests: nextCount,
        isLoading: nextCount > 0,
        loadingText: nextCount === 0 ? null : state.loadingText,
      };
    }),

  setLoading: (loading, message) =>
    set({
      isLoading: loading,
      loadingText: loading ? message || 'Carregando...' : null,
      activeRequests: loading ? 1 : 0,
    }),
}));
