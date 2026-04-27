import { create } from 'zustand';
import { DIRECTORY_LAWYERS, type DirectoryLawyer } from '../constants/lawyersDirectory';
import { MOCK_LAWYERS, type Lawyer } from '../constants/mockData';

type LawyerDataState = {
  directoryLawyers: DirectoryLawyer[] | null;
  featuredLawyers: Lawyer[] | null;
  isHydrating: boolean;
  hydrated: boolean;
  byId: Record<string, Lawyer>;
  hydrateLawyerData: () => Promise<void>;
  preloadLawyerData: (id: string) => void;
};

export const useLawyerDataStore = create<LawyerDataState>((set, get) => ({
  directoryLawyers: null,
  featuredLawyers: null,
  isHydrating: false,
  hydrated: false,
  byId: {},
  hydrateLawyerData: async () => {
    const state = get();
    if (state.hydrated || state.isHydrating) return;
    set({ isHydrating: true });
    try {
      const byId = Object.fromEntries(MOCK_LAWYERS.map((l) => [l.id, l]));
      set({
        directoryLawyers: DIRECTORY_LAWYERS,
        featuredLawyers: MOCK_LAWYERS,
        byId,
        hydrated: true,
      });
    } finally {
      set({ isHydrating: false });
    }
  },
  preloadLawyerData: (id: string) => {
    const state = get();
    if (state.byId[id]) return;
    const match = MOCK_LAWYERS.find((l) => l.id === id);
    if (!match) return;
    set((prev) => ({ byId: { ...prev.byId, [id]: match } }));
  },
}));

