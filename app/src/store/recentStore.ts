import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../hooks/useProducts';

interface RecentState {
  recentSearches: string[];
  recentlyViewed: Product[];
  addRecentSearch: (query: string) => void;
  removeRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  addRecentlyViewed: (product: Product) => void;
  clearRecentlyViewed: () => void;
}

export const useRecentStore = create<RecentState>()(
  persist(
    (set, get) => ({
      recentSearches: [],
      recentlyViewed: [],

      addRecentSearch: (query) => {
        set((state) => {
          const filtered = state.recentSearches.filter(q => q.toLowerCase() !== query.toLowerCase());
          return { recentSearches: [query, ...filtered].slice(0, 10) };
        });
      },

      removeRecentSearch: (query) => {
        set((state) => ({
          recentSearches: state.recentSearches.filter(q => q !== query)
        }));
      },

      clearRecentSearches: () => {
        set({ recentSearches: [] });
      },

      addRecentlyViewed: (product) => {
        set((state) => {
          const filtered = state.recentlyViewed.filter(p => p._id !== product._id);
          return { recentlyViewed: [product, ...filtered].slice(0, 15) };
        });
      },

      clearRecentlyViewed: () => {
        set({ recentlyViewed: [] });
      },
    }),
    {
      name: 'recent-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
