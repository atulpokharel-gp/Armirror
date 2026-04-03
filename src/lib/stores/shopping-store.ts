import { create } from "zustand";
import { MockProduct, SavedItem } from "@/types/product";

interface ShoppingStore {
  savedItems: SavedItem[];
  recentlyViewed: MockProduct[];
  selectedFilters: {
    category: string | null;
    gender: string | null;
    priceRange: [number, number];
    brands: string[];
  };
  addSavedItem: (item: SavedItem) => void;
  removeSavedItem: (productId: string) => void;
  isSaved: (productId: string) => boolean;
  addRecentlyViewed: (product: MockProduct) => void;
  setFilter: (key: string, value: unknown) => void;
  resetFilters: () => void;
}

export const useShoppingStore = create<ShoppingStore>((set, get) => ({
  savedItems: [],
  recentlyViewed: [],
  selectedFilters: {
    category: null,
    gender: null,
    priceRange: [0, 2000],
    brands: [],
  },
  addSavedItem: (item) =>
    set((s) => ({ savedItems: [...s.savedItems.filter((i) => i.productId !== item.productId), item] })),
  removeSavedItem: (productId) =>
    set((s) => ({ savedItems: s.savedItems.filter((i) => i.productId !== productId) })),
  isSaved: (productId) => get().savedItems.some((i) => i.productId === productId),
  addRecentlyViewed: (product) =>
    set((s) => ({
      recentlyViewed: [product, ...s.recentlyViewed.filter((p) => p.id !== product.id)].slice(0, 10),
    })),
  setFilter: (key, value) =>
    set((s) => ({ selectedFilters: { ...s.selectedFilters, [key]: value } })),
  resetFilters: () =>
    set({ selectedFilters: { category: null, gender: null, priceRange: [0, 2000], brands: [] } }),
}));
