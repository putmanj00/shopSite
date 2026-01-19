import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RecentlyViewedProduct {
  id: string;
  handle: string;
  title: string;
  imageUrl: string | null;
  imageAlt: string | null;
  price: string;
  currencyCode: string;
  viewedAt: number;
}

interface RecentlyViewedStore {
  products: RecentlyViewedProduct[];
  addProduct: (product: Omit<RecentlyViewedProduct, 'viewedAt'>) => void;
  clearHistory: () => void;
  getRecentProducts: (limit?: number) => RecentlyViewedProduct[];
}

const MAX_RECENT_PRODUCTS = 20;

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set, get) => ({
      products: [],

      addProduct: (product) => {
        const { products } = get();

        // Remove if already exists
        const filtered = products.filter((p) => p.id !== product.id);

        // Add to beginning with timestamp
        const newProduct: RecentlyViewedProduct = {
          ...product,
          viewedAt: Date.now(),
        };

        // Keep only the most recent products
        const updated = [newProduct, ...filtered].slice(0, MAX_RECENT_PRODUCTS);

        set({ products: updated });
      },

      clearHistory: () => set({ products: [] }),

      getRecentProducts: (limit = 8) => {
        const { products } = get();
        return products.slice(0, limit);
      },
    }),
    {
      name: 'shopsite-recently-viewed',
    }
  )
);
