import { create } from 'zustand';
import { MOCK_TRANSACTIONS } from '../constants/mockData';

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
  addMoney: (amount: number) => void;
  deduct: (amount: number) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  balance: 2450,
  transactions: MOCK_TRANSACTIONS as Transaction[],
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
