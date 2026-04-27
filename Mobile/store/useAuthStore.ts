/**
 * Auth store — in-session only (no cross-refresh persistence).
 *
 * The persist middleware with createJSONStorage causes silent initialization
 * errors in some Expo web/SPA configurations that result in a blank white page.
 * We use plain Zustand for reliable cross-platform operation.
 *
 * Session behaviour:
 *  • User stays logged in for the duration of the browser session / app session
 *  • Refreshing the page requires logging in again (by design for a legal app)
 *  • Logout clears auth state immediately
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
  login:       (user: User) => void;
  logout:      () => void;
  setWhatsapp: (val: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  user: null,
  whatsappUpdates: true,
  login:       (user) => set({ isLoggedIn: true, user }),
  logout:      ()     => set({ isLoggedIn: false, user: null }),
  setWhatsapp: (val)  => set({ whatsappUpdates: val }),
}));
