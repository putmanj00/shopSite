import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ShopifyProduct } from '@/types/shopify';

interface WishlistStore {
  items: ShopifyProduct[];
  addItem: (product: ShopifyProduct) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const { items } = get();
        const exists = items.some((item) => item.id === product.id);
        if (!exists) {
          set({ items: [...items, product] });
        }
      },
      removeItem: (productId) => {
        const { items } = get();
        set({ items: items.filter((item) => item.id !== productId) });
      },
      isInWishlist: (productId) => {
        const { items } = get();
        return items.some((item) => item.id === productId);
      },
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'shopsite-wishlist',
    }
  )
);
