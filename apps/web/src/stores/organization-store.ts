import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Organization {
  id: string;
  name: string;
  type: 'pessoal' | 'empresarial';
  document?: string | null;
  userRole?: 'owner' | 'gestor' | 'membro';
}

interface OrganizationState {
  activeOrganization: Organization | null;
  organizations: Organization[];
  setActiveOrganization: (org: Organization | null) => void;
  setOrganizations: (orgs: Organization[]) => void;
  clearOrganizations: () => void;
}

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set) => ({
      activeOrganization: null,
      organizations: [],

      setActiveOrganization: (activeOrganization) => set({ activeOrganization }),

      setOrganizations: (organizations) =>
        set((state) => {
          let active = state.activeOrganization;
          // Default to first organization if current active is null or not in list
          if (organizations.length > 0 && (!active || !organizations.some((o) => o.id === active?.id))) {
            active = organizations[0];
          }
          return {
            organizations,
            activeOrganization: active,
          };
        }),

      clearOrganizations: () => set({ activeOrganization: null, organizations: [] }),
    }),
    {
      name: 'kharify-active-org',
    }
  )
);
