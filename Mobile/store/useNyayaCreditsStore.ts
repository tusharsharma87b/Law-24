import { create } from 'zustand';

/** Free tier: questions per calendar day (local), inclusive range 10–20 per product spec. */
export const NYAYA_FREE_DAILY_LIMIT = 15;

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

type NyayaCreditsState = {
  /** ISO-ish date key when `usedFreeToday` applies */
  dayKey: string;
  usedFreeToday: number;
  /** Purchased question credits (not reset daily) */
  packBalance: number;
  ensureDay: () => void;
  /** Remaining free questions for today (0..limit) */
  freeRemainingToday: () => number;
  /** Total questions user can still ask (free remaining + pack). */
  questionsRemaining: () => number;
  canAskQuestion: () => boolean;
  /** Returns false if blocked */
  consumeQuestion: () => boolean;
  purchasePack: (kind: '99' | '299') => void;
  resetForDemo: () => void;
};

export const useNyayaCreditsStore = create<NyayaCreditsState>((set, get) => ({
  dayKey: todayKey(),
  usedFreeToday: 0,
  packBalance: 0,

  ensureDay: () => {
    const key = todayKey();
    const s = get();
    if (s.dayKey === key) return;
    set({ dayKey: key, usedFreeToday: 0 });
  },

  freeRemainingToday: () => {
    get().ensureDay();
    return Math.max(0, NYAYA_FREE_DAILY_LIMIT - get().usedFreeToday);
  },

  questionsRemaining: () => {
    get().ensureDay();
    return get().freeRemainingToday() + get().packBalance;
  },

  canAskQuestion: () => get().questionsRemaining() > 0,

  consumeQuestion: () => {
    get().ensureDay();
    const s = get();
    if (s.usedFreeToday < NYAYA_FREE_DAILY_LIMIT) {
      set({ usedFreeToday: s.usedFreeToday + 1 });
      return true;
    }
    if (s.packBalance > 0) {
      set({ packBalance: s.packBalance - 1 });
      return true;
    }
    return false;
  },

  purchasePack: (kind) => {
    get().ensureDay();
    if (kind === '99') set((s) => ({ packBalance: s.packBalance + 100 }));
    else set((s) => ({ packBalance: s.packBalance + 500 }));
  },

  resetForDemo: () => set({ dayKey: todayKey(), usedFreeToday: 0, packBalance: 0 }),
}));
