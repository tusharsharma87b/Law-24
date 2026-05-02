import { create } from 'zustand';
import { MOCK_TRANSACTIONS } from '../constants/mockData';
import { apiGet } from '../src/services/api';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  label: string;
  amount: number;
  date: string;
  icon: string;
}

interface WalletState {
  balance: number;
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  hydrateWallet: (userId: string) => Promise<void>;
  addMoney: (amount: number) => void;
  deduct: (amount: number) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  balance: 2450,
  transactions: MOCK_TRANSACTIONS as Transaction[],
  loading: false,
  error: null,
  hydrateWallet: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const wallet = await apiGet(`/wallet/${userId}`) as { balance?: number; transactions?: any[] } | null;
      set({
        balance: Number(wallet?.balance ?? 0),
        transactions: Array.isArray(wallet?.transactions) ? wallet.transactions : [],
      });
    } catch (e) {
      set({ error: (e as Error).message || 'Failed to load wallet' });
    } finally {
      set({ loading: false });
    }
  },
  addMoney: (amount) =>
    set((s) => ({
      balance: s.balance + amount,
      transactions: [
        { id: `T${Date.now()}`, type: 'credit', label: 'Wallet Top-up', amount, date: 'Today', icon: 'add' },
        ...s.transactions,
      ],
    })),
  deduct: (amount) =>
    set((s) => ({
      balance: Math.max(0, s.balance - amount),
    })),
}));
