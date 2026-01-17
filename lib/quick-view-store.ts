import { create } from 'zustand';
import type { ShopifyProduct } from '@/types/shopify';

interface QuickViewStore {
  isOpen: boolean;
  product: ShopifyProduct | null;
  openQuickView: (product: ShopifyProduct) => void;
  closeQuickView: () => void;
}

export const useQuickViewStore = create<QuickViewStore>((set) => ({
  isOpen: false,
  product: null,

  openQuickView: (product: ShopifyProduct) => {
    set({ isOpen: true, product });
  },

  closeQuickView: () => {
    set({ isOpen: false, product: null });
  },
}));
