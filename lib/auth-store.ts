import { create } from 'zustand';

interface Customer {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  displayName: string;
}

interface AuthStore {
  customer: Customer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  checkAuth: () => Promise<void>;
  login: (returnTo?: string) => void;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  customer: null,
  isAuthenticated: false,
  isLoading: true, // Start as loading to check auth on mount
  error: null,

  checkAuth: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/auth/customer/me');
      const data = await response.json();

      if (data.authenticated && data.customer) {
        set({
          isAuthenticated: true,
          customer: data.customer,
          isLoading: false,
        });
      } else {
        set({
          isAuthenticated: false,
          customer: null,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      set({
        isAuthenticated: false,
        customer: null,
        isLoading: false,
        error: 'Failed to check authentication status',
      });
    }
  },

  login: (returnTo?: string) => {
    // Redirect to the authorize endpoint
    const params = returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : '';
    window.location.href = `/api/auth/customer/authorize${params}`;
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      // Redirect to logout endpoint (it will handle cookie clearing and Shopify logout)
      window.location.href = '/api/auth/customer/logout';
    } catch (error) {
      console.error('Logout error:', error);
      set({ isLoading: false, error: 'Failed to logout' });
    }
  },

  clearError: () => set({ error: null }),
}));
