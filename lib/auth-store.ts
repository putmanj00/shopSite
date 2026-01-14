import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ShopifyCustomer } from '@/types/shopify';

interface AuthStore {
  customer: ShopifyCustomer | null;
  accessToken: string | null;
  expiresAt: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<any>;
  logout: () => Promise<void>;
  fetchCustomer: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      customer: null,
      accessToken: null,
      expiresAt: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Failed to login');
          }

          if (data.accessToken) {
            set({
              accessToken: data.accessToken,
              expiresAt: data.expiresAt,
            });
            // Fetch customer data immediately after login
            await get().fetchCustomer();
          }
        } catch (error: unknown) {
          console.error('Login error:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to login' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (email, password, firstName, lastName) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, firstName, lastName }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Failed to register');
          }

          // The API route automatically logs in after registration
          if (data.accessToken) {
            set({
              accessToken: data.accessToken,
              expiresAt: data.expiresAt,
            });
            // Fetch customer data
            await get().fetchCustomer();
          }
          
          return data;
        } catch (error: unknown) {
          console.error('Registration error:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to register' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        const { accessToken } = get();
        
        set({ isLoading: true });
        try {
          // Call logout API (fire and forget)
          if (accessToken) {
            fetch('/api/auth/logout', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ accessToken }),
            }).catch(err => console.error('Logout API error:', err));
          }
        } catch (error) {
          console.error('Logout error:', error);
          // Continue with local cleanup even if API call fails
        } finally {
          set({
            customer: null,
            accessToken: null,
            expiresAt: null,
            isLoading: false,
            error: null,
          });
        }
      },

      fetchCustomer: async () => {
        const { accessToken } = get();
        if (!accessToken) return;

        set({ isLoading: true });
        try {
          const response = await fetch('/api/auth/customer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken }),
          });

          const data = await response.json();

          if (response.ok && data.customer) {
            set({ customer: data.customer });
          } else {
            // Token might be invalid
            set({ accessToken: null, expiresAt: null, customer: null });
          }
        } catch (error) {
          console.error('Fetch customer error:', error);
          set({ accessToken: null, expiresAt: null, customer: null });
        } finally {
          set({ isLoading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'shopsite-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        expiresAt: state.expiresAt,
        customer: state.customer,
      }),
    }
  )
);
