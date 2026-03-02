import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ShopifyCart } from '@/types/shopify';
import {
  CREATE_CART_MUTATION,
  ADD_TO_CART_MUTATION,
  UPDATE_CART_MUTATION,
  REMOVE_FROM_CART_MUTATION,
} from './shopify-queries';
import { getShopifyClient } from './shopify';

interface CartStore {
  cart: ShopifyCart | null;
  isOpen: boolean;
  isLoading: boolean;

  // Actions
  openCart: () => void;
  closeCart: () => void;
  addToCart: (variantId: string, quantity?: number) => Promise<void>;
  updateCartLine: (lineId: string, quantity: number) => Promise<void>;
  removeFromCart: (lineId: string) => Promise<void>;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: null,
      isOpen: false,
      isLoading: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      addToCart: async (variantId: string, quantity: number = 1) => {
        set({ isLoading: true });
        try {
          const client = getShopifyClient();
          const currentCart = get().cart;

          if (!currentCart) {
            // Create new cart
            const response = await client.request<{
              cartCreate: {
                cart: ShopifyCart;
                userErrors: { field: string[]; message: string }[];
              };
            }>(CREATE_CART_MUTATION, {
              variables: {
                input: {
                  lines: [
                    {
                      merchandiseId: variantId,
                      quantity,
                    },
                  ],
                },
              },
            });

            if (response.errors) {
              const errorMessages = Array.isArray(response.errors)
                ? response.errors
                    .map((e: { message: string }) => e.message)
                    .join(', ')
                : String(response.errors);
              throw new Error(errorMessages);
            }

            if (
              response.data?.cartCreate.userErrors &&
              response.data.cartCreate.userErrors.length > 0
            ) {
              throw new Error(response.data.cartCreate.userErrors[0].message);
            }

            set({ cart: response.data?.cartCreate.cart, isOpen: true });
          } else {
            // Add to existing cart
            const response = await client.request<{
              cartLinesAdd: {
                cart: ShopifyCart;
                userErrors: { field: string[]; message: string }[];
              };
            }>(ADD_TO_CART_MUTATION, {
              variables: {
                cartId: currentCart.id,
                lines: [
                  {
                    merchandiseId: variantId,
                    quantity,
                  },
                ],
              },
            });

            if (response.errors) {
              const errorMessages = Array.isArray(response.errors)
                ? response.errors
                    .map((e: { message: string }) => e.message)
                    .join(', ')
                : String(response.errors);
              throw new Error(errorMessages);
            }

            if (
              response.data?.cartLinesAdd.userErrors &&
              response.data.cartLinesAdd.userErrors.length > 0
            ) {
              throw new Error(response.data.cartLinesAdd.userErrors[0].message);
            }

            set({ cart: response.data?.cartLinesAdd.cart, isOpen: true });
          }
        } catch (error) {
          console.error('Error adding to cart:', error);
          if (error instanceof Error && error.message.includes('cart does not exist')) {
            // Stale cart — clear it and retry with a fresh one
            set({ cart: null });
            return get().addToCart(variantId, quantity);
          }
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      updateCartLine: async (lineId: string, quantity: number) => {
        const currentCart = get().cart;
        if (!currentCart) return;

        set({ isLoading: true });
        try {
          const client = getShopifyClient();
          const response = await client.request<{
            cartLinesUpdate: {
              cart: ShopifyCart;
              userErrors: { field: string[]; message: string }[];
            };
          }>(UPDATE_CART_MUTATION, {
            variables: {
              cartId: currentCart.id,
              lines: [
                {
                  id: lineId,
                  quantity,
                },
              ],
            },
          });

          if (response.errors) {
            const errorMessages = Array.isArray(response.errors)
              ? response.errors
                  .map((e: { message: string }) => e.message)
                  .join(', ')
              : String(response.errors);
            throw new Error(errorMessages);
          }

          if (
            response.data?.cartLinesUpdate.userErrors &&
            response.data.cartLinesUpdate.userErrors.length > 0
          ) {
            throw new Error(
              response.data.cartLinesUpdate.userErrors[0].message
            );
          }

          set({ cart: response.data?.cartLinesUpdate.cart });
        } catch (error) {
          console.error('Error updating cart:', error);
          if (error instanceof Error && error.message.includes('cart does not exist')) {
            set({ cart: null });
            return;
          }
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      removeFromCart: async (lineId: string) => {
        const currentCart = get().cart;
        if (!currentCart) return;

        set({ isLoading: true });
        try {
          const client = getShopifyClient();
          const response = await client.request<{
            cartLinesRemove: {
              cart: ShopifyCart;
              userErrors: { field: string[]; message: string }[];
            };
          }>(REMOVE_FROM_CART_MUTATION, {
            variables: {
              cartId: currentCart.id,
              lineIds: [lineId],
            },
          });

          if (response.errors) {
            const errorMessages = Array.isArray(response.errors)
              ? response.errors
                  .map((e: { message: string }) => e.message)
                  .join(', ')
              : String(response.errors);
            throw new Error(errorMessages);
          }

          if (
            response.data?.cartLinesRemove.userErrors &&
            response.data.cartLinesRemove.userErrors.length > 0
          ) {
            throw new Error(
              response.data.cartLinesRemove.userErrors[0].message
            );
          }

          set({ cart: response.data?.cartLinesRemove.cart });
        } catch (error) {
          console.error('Error removing from cart:', error);
          if (error instanceof Error && error.message.includes('cart does not exist')) {
            set({ cart: null });
            return;
          }
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      clearCart: () => {
        set({ cart: null, isOpen: false });
      },
    }),
    {
      name: 'shopsite-cart',
      partialize: (state) => ({ cart: state.cart }),
    }
  )
);
