/**
 * Zustand store for Lawyers screen filter state.
 * Lives outside React component lifecycle → survives web navigation remounts.
 * No router.setParams needed — pure in-memory state.
 */
import { create } from 'zustand';
import type { DirectoryCategory, SortKey } from '../constants/lawyersDirectory';

export type SheetFilters = {
  location: 'all' | 'Delhi' | 'Mumbai' | 'Bangalore';
  rating: 'any' | '4.0' | '4.5';
  price: 'any' | 'under20' | 'under50' | '20to50' | 'above50';
  courtType: 'all' | 'district' | 'high' | 'supreme';
  onlineOnly: boolean;
};

export const DEFAULT_SHEET_STORE: SheetFilters = {
  location: 'all',
  rating: 'any',
  price: 'any',
  courtType: 'all',
  onlineOnly: false,
};

interface LawyerFiltersState {
  // Categories as array (Set not serialisable by Zustand, convert at use-site)
  categories: DirectoryCategory[];
  sort: SortKey;
  appliedSheet: SheetFilters;
  search: string;

  setCategories: (cats: DirectoryCategory[]) => void;
  setSort: (s: SortKey) => void;
  setAppliedSheet: (s: SheetFilters) => void;
  setSearch: (q: string) => void;
  clearAll: () => void;
}

export const useLawyerFiltersStore = create<LawyerFiltersState>((set) => ({
  categories: [],
  sort: 'rating',
  appliedSheet: DEFAULT_SHEET_STORE,
  search: '',

  setCategories: (categories) => set({ categories }),
  setSort: (sort) => set({ sort }),
  setAppliedSheet: (appliedSheet) => set({ appliedSheet }),
  setSearch: (search) => set({ search }),
  clearAll: () => set({
    categories: [],
    sort: 'rating',
    appliedSheet: DEFAULT_SHEET_STORE,
    search: '',
  }),
}));
