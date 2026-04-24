import { create } from 'zustand';
import { MOCK_CASES } from '../constants/mockData';

interface CaseState {
  cases: typeof MOCK_CASES;
  activeCaseId: string | null;
  setActiveCase: (id: string) => void;
}

export const useCaseStore = create<CaseState>((set) => ({
  cases: MOCK_CASES,
  activeCaseId: null,
  setActiveCase: (id) => set({ activeCaseId: id }),
}));
