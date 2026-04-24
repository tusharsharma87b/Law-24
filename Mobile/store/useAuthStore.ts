/**
 * Auth store — in-memory only (no persistence).
 * The app always starts with isLoggedIn = false, so the login screen
 * is always shown on a fresh load / refresh. Users log in each session.
 */
import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  plan: 'free' | 'standard' | 'premium_pro';
  clientId: string;
  avatarInitials: string;
}

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  whatsappUpdates: boolean;
  login: (user: User) => void;
  logout: () => void;
  setWhatsapp: (val: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  user: null,
  whatsappUpdates: true,
  login:      (user) => set({ isLoggedIn: true, user }),
  logout:     ()     => set({ isLoggedIn: false, user: null }),
  setWhatsapp:(val)  => set({ whatsappUpdates: val }),
}));
