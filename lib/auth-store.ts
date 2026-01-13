
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getShopifyClient } from './shopify';
import {
  CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION,
  CUSTOMER_ACCESS_TOKEN_DELETE_MUTATION,
  CUSTOMER_CREATE_MUTATION,
  GET_CUSTOMER_QUERY,
} from './shopify-queries';
import type {
  ShopifyCustomer,
  CustomerAccessTokenCreatePayload,
  CustomerCreatePayload,
  CustomerAccessTokenDeletePayload,
  CustomerQueryResponse,
} from '@/types/shopify';

interface AuthStore {
  customer: ShopifyCustomer | null;
  accessToken: string | null;
  expiresAt: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
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
          const client = getShopifyClient();
          const response = await client.request<{
            customerAccessTokenCreate: CustomerAccessTokenCreatePayload;
          }>(CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION, {
            variables: {
              input: { email, password },
            },
          });

          const { customerAccessToken, customerUserErrors } =
            response.data?.customerAccessTokenCreate || {};

          if (customerUserErrors && customerUserErrors.length > 0) {
            throw new Error(customerUserErrors[0].message);
          }

          if (customerAccessToken) {
            set({
              accessToken: customerAccessToken.accessToken,
              expiresAt: customerAccessToken.expiresAt,
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
          const client = getShopifyClient();
          const response = await client.request<{
            customerCreate: CustomerCreatePayload;
          }>(CUSTOMER_CREATE_MUTATION, {
            variables: {
              input: { email, password, firstName, lastName },
            },
          });

          const { customerUserErrors } = response.data?.customerCreate || {};

          if (customerUserErrors && customerUserErrors.length > 0) {
            throw new Error(customerUserErrors[0].message);
          }

          // Automatically login after successful registration
          // Note: Some stores require email verification before login is allowed.
          // For this implementation valid shops, we attempt to login.
          await get().login(email, password);

          // Trigger Welcome Email (Fire and forget, don't block UI)
          fetch('/api/email/welcome', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, firstName: firstName || 'Customer' }),
          }).catch(err => console.error('Failed to trigger welcome email:', err));

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
        if (!accessToken) {
          set({ customer: null, accessToken: null, expiresAt: null });
          return;
        }

        set({ isLoading: true });
        try {
          const client = getShopifyClient();
          await client.request<{
            customerAccessTokenDelete: CustomerAccessTokenDeletePayload;
          }>(CUSTOMER_ACCESS_TOKEN_DELETE_MUTATION, {
            variables: {
              customerAccessToken: accessToken,
            },
          });
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
          const client = getShopifyClient();
          const response = await client.request<CustomerQueryResponse>(
            GET_CUSTOMER_QUERY,
            {
              variables: {
                customerAccessToken: accessToken,
              },
            }
          );

          if (response.data?.customer) {
            set({ customer: response.data.customer });
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
