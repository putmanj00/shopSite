import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SearchState {
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  removeRecentSearch: (query: string) => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      recentSearches: [],
      addRecentSearch: (query) =>
        set((state) => {
          const trimmedQuery = query.trim();
          if (!trimmedQuery) return state;
          
          // Remove if exists, then add to front (LRU-like)
          const newSearches = [
            trimmedQuery,
            ...state.recentSearches.filter((s) => s !== trimmedQuery),
          ].slice(0, 5); // Keep last 5

          return { recentSearches: newSearches };
        }),
      clearRecentSearches: () => set({ recentSearches: [] }),
      removeRecentSearch: (query) =>
        set((state) => ({
          recentSearches: state.recentSearches.filter((s) => s !== query),
        })),
    }),
    {
      name: 'search-storage',
    }
  )
);
