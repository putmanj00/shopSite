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

// @shopify/graphql-client reports request failures as one ResponseErrors
// object ({ message, networkStatusCode, graphQLErrors }), never an array;
// String() of it is "[object Object]", which hid the real cause.
type ResponseErrors = {
  message?: string;
  networkStatusCode?: number;
  graphQLErrors?: { message?: string }[];
};

function responseErrorMessage(errors: ResponseErrors): string {
  const details = errors.graphQLErrors
    ?.map((e) => e.message)
    .filter(Boolean)
    .join(', ');
  const status = errors.networkStatusCode
    ? ` (HTTP ${errors.networkStatusCode})`
    : '';
  return `${errors.message ?? 'Shopify request failed'}${status}${details ? `: ${details}` : ''}`;
}

type CartUserError = { field: string[] | null; message: string };

// Shopify carts expire after a stretch of inactivity, and the id persisted in
// localStorage then answers every mutation with a `cartId` userError ("The
// specified cart does not exist."). That is not a failure to surface: the
// visitor's cart is simply gone, so start over instead of dead-ending.
function isMissingCartError(userErrors: CartUserError[] | undefined): boolean {
  return !!userErrors?.some((e) => e.field?.[0] === 'cartId');
}

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

          if (currentCart) {
            // Add to existing cart
            const response = await client.request<{
              cartLinesAdd: {
                cart: ShopifyCart;
                userErrors: CartUserError[];
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
              throw new Error(responseErrorMessage(response.errors));
            }

            const userErrors = response.data?.cartLinesAdd.userErrors;
            if (!isMissingCartError(userErrors)) {
              if (userErrors && userErrors.length > 0) {
                throw new Error(userErrors[0].message);
              }
              set({ cart: response.data?.cartLinesAdd.cart, isOpen: true });
              return;
            }
            // Expired cart: fall through and create a fresh one.
          }

          // No cart yet, or the persisted one expired: create a new cart.
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
            throw new Error(responseErrorMessage(response.errors));
          }

          if (
            response.data?.cartCreate.userErrors &&
            response.data.cartCreate.userErrors.length > 0
          ) {
            throw new Error(response.data.cartCreate.userErrors[0].message);
          }

          set({ cart: response.data?.cartCreate.cart, isOpen: true });
        } catch (error) {
          console.error('Error adding to cart:', error);
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
            throw new Error(responseErrorMessage(response.errors));
          }

          if (isMissingCartError(response.data?.cartLinesUpdate.userErrors)) {
            set({ cart: null });
            return;
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
            throw new Error(responseErrorMessage(response.errors));
          }

          if (isMissingCartError(response.data?.cartLinesRemove.userErrors)) {
            set({ cart: null });
            return;
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
