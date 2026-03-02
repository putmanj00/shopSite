import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ShopifyCart } from '@/types/shopify';

// Must be hoisted before imports that use these modules
vi.mock('@sentry/nextjs', () => ({
  init: vi.fn(),
  captureException: vi.fn(),
}));

const mockRequest = vi.fn();
vi.mock('@/lib/shopify', () => ({
  getShopifyClient: vi.fn(() => ({ request: mockRequest })),
}));

// Import after mocks are registered
import * as Sentry from '@sentry/nextjs';
import { useCartStore } from '../cart-store';

// Minimal cart fixture with the shape the store expects
const STALE_CART_ID = 'gid://shopify/Cart/stale-000';
const NEW_CART_ID = 'gid://shopify/Cart/fresh-001';

const makeCart = (id: string): ShopifyCart => ({
  id,
  checkoutUrl: `https://shop.myshopify.com/cart/${id}`,
  totalQuantity: 1,
  cost: {
    subtotalAmount: { amount: '10.00', currencyCode: 'USD' },
    totalAmount: { amount: '10.00', currencyCode: 'USD' },
    totalTaxAmount: null,
  },
  lines: {
    edges: [
      {
        node: {
          id: 'gid://shopify/CartLine/line-1',
          quantity: 1,
          merchandise: {
            id: 'gid://shopify/ProductVariant/1',
            title: 'Default Title',
            availableForSale: true,
            quantityAvailable: 10,
            price: { amount: '10.00', currencyCode: 'USD' },
            compareAtPrice: null,
            selectedOptions: [],
            image: null,
            product: {
              id: 'gid://shopify/Product/1',
              handle: 'test-product',
              title: 'Test Product',
              productType: '',
              vendor: '',
            },
          },
          cost: {
            totalAmount: { amount: '10.00', currencyCode: 'USD' },
            amountPerQuantity: { amount: '10.00', currencyCode: 'USD' },
          },
        },
      },
    ],
  },
});

const STALE_CART_ERROR = new Error('The specified cart does not exist.');

describe('cart-store stale cart recovery', () => {
  beforeEach(() => {
    useCartStore.setState({ cart: makeCart(STALE_CART_ID), isOpen: true, isLoading: false });
    localStorage.clear();
  });

  describe('removeFromCart', () => {
    it('clears cart state when Shopify returns "cart does not exist"', async () => {
      mockRequest.mockRejectedValueOnce(STALE_CART_ERROR);

      await useCartStore.getState().removeFromCart('gid://shopify/CartLine/line-1');

      expect(useCartStore.getState().cart).toBeNull();
    });

    it('reports the stale cart error to Sentry with stale_cart tag', async () => {
      mockRequest.mockRejectedValueOnce(STALE_CART_ERROR);

      await useCartStore.getState().removeFromCart('gid://shopify/CartLine/line-1');

      expect(Sentry.captureException).toHaveBeenCalledWith(
        STALE_CART_ERROR,
        expect.objectContaining({ tags: { stale_cart: true } })
      );
    });

    it('re-throws unrelated errors without clearing the cart', async () => {
      const networkError = new Error('Network request failed');
      mockRequest.mockRejectedValueOnce(networkError);

      await expect(
        useCartStore.getState().removeFromCart('gid://shopify/CartLine/line-1')
      ).rejects.toThrow('Network request failed');

      expect(useCartStore.getState().cart?.id).toBe(STALE_CART_ID);
    });
  });

  describe('updateCartLine', () => {
    it('clears cart state when Shopify returns "cart does not exist"', async () => {
      mockRequest.mockRejectedValueOnce(STALE_CART_ERROR);

      await useCartStore.getState().updateCartLine('gid://shopify/CartLine/line-1', 2);

      expect(useCartStore.getState().cart).toBeNull();
    });

    it('reports the stale cart error to Sentry with stale_cart tag', async () => {
      mockRequest.mockRejectedValueOnce(STALE_CART_ERROR);

      await useCartStore.getState().updateCartLine('gid://shopify/CartLine/line-1', 2);

      expect(Sentry.captureException).toHaveBeenCalledWith(
        STALE_CART_ERROR,
        expect.objectContaining({ tags: { stale_cart: true } })
      );
    });

    it('re-throws unrelated errors without clearing the cart', async () => {
      const networkError = new Error('Network request failed');
      mockRequest.mockRejectedValueOnce(networkError);

      await expect(
        useCartStore.getState().updateCartLine('gid://shopify/CartLine/line-1', 2)
      ).rejects.toThrow('Network request failed');

      expect(useCartStore.getState().cart?.id).toBe(STALE_CART_ID);
    });
  });

  describe('addToCart', () => {
    it('clears stale cart, retries, and resolves with a fresh cart', async () => {
      // First call: adding to stale cart fails
      mockRequest.mockRejectedValueOnce(STALE_CART_ERROR);
      // Second call: creating a fresh cart succeeds
      mockRequest.mockResolvedValueOnce({
        data: { cartCreate: { cart: makeCart(NEW_CART_ID), userErrors: [] } },
        errors: null,
      });

      await useCartStore.getState().addToCart('gid://shopify/ProductVariant/2');

      expect(useCartStore.getState().cart?.id).toBe(NEW_CART_ID);
    });

    it('reports the stale cart error to Sentry before retrying', async () => {
      mockRequest.mockRejectedValueOnce(STALE_CART_ERROR);
      mockRequest.mockResolvedValueOnce({
        data: { cartCreate: { cart: makeCart(NEW_CART_ID), userErrors: [] } },
        errors: null,
      });

      await useCartStore.getState().addToCart('gid://shopify/ProductVariant/2');

      expect(Sentry.captureException).toHaveBeenCalledWith(
        STALE_CART_ERROR,
        expect.objectContaining({ tags: { stale_cart: true } })
      );
    });
  });
});
