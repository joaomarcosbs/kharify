import axios, { InternalAxiosRequestConfig } from 'axios';
import { useLoadingStore } from '@/stores/loading-store';
import { useOrganizationStore } from '@/stores/organization-store';

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    skipGlobalLoading?: boolean;
    loadingText?: string;
  }
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3080/v1',
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Auth, Active Organization ID, and Trigger Zustand Loading
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Start global loading unless explicitly bypassed
    if (!config.skipGlobalLoading) {
      useLoadingStore.getState().startLoading(config.loadingText);
    }

    // Attach active organization ID header
    const activeOrg = useOrganizationStore.getState().activeOrganization;
    if (activeOrg?.id) {
      config.headers['X-Organization-Id'] = activeOrg.id;
    }

    return config;
  },
  (error) => {
    useLoadingStore.getState().stopLoading();
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle completion, errors, and session expiry
api.interceptors.response.use(
  (response) => {
    if (!response.config.skipGlobalLoading) {
      useLoadingStore.getState().stopLoading();
    }
    response.data = response.data?.data ?? response.data;
    return response;
  },
  (error) => {
    if (!error.config?.skipGlobalLoading) {
      useLoadingStore.getState().stopLoading();
    }

    // Handle 401 Unauthorized redirect gracefully
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        // The auth cookie is HttpOnly, so clear it through the Next.js route
        // before redirecting. Otherwise the proxy can send the stale token
        // back to /home and create an authentication redirect loop.
        void fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'same-origin',
        }).finally(() => {
          window.location.replace('/login');
        });
      }
    }

    return Promise.reject(error);
  }
);
