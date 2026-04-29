import { create } from 'zustand';
import { apiGet, clearAccessToken, getStoredAccessToken, saveAccessToken } from '../src/services/api';

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
  token: string | null;
  isLoggedIn: boolean;
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  restoringSession: boolean;
  whatsappUpdates: boolean;
  login:       (user: User, accessToken?: string) => Promise<void>;
  restoreSession: () => Promise<void>;
  logout:      () => Promise<void>;
  setWhatsapp: (val: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  isLoggedIn: false,
  isAuthenticated: false,
  user: null,
  accessToken: null,
  restoringSession: false,
  whatsappUpdates: true,
  login: async (user, accessToken) => {
    if (accessToken) {
      await saveAccessToken(accessToken);
    }
    set({
      token: accessToken ?? null,
      accessToken: accessToken ?? null,
      isLoggedIn: true,
      isAuthenticated: true,
      user,
    });
  },
  restoreSession: async () => {
    set({ restoringSession: true });
    try {
      const storedToken = await getStoredAccessToken();
      if (!storedToken) {
        set({
          token: null,
          accessToken: null,
          isLoggedIn: false,
          isAuthenticated: false,
          user: null,
          restoringSession: false,
        });
        return;
      }

      const me = (await apiGet('/auth/me')) as {
        id: string;
        name?: string | null;
        phone?: string | null;
        email?: string | null;
      } | null;
      if (!me || typeof me.id !== 'string') {
        await clearAccessToken();
        set({
          token: null,
          accessToken: null,
          isLoggedIn: false,
          isAuthenticated: false,
          user: null,
          restoringSession: false,
        });
        return;
      }
      const user: User = {
        id: me.id,
        name: me.name ?? 'Law24 User',
        phone: me.phone ?? '',
        email: me.email ?? undefined,
        plan: 'free',
        clientId: `#${String(me.id).slice(-4)}`,
        avatarInitials: String(me.name ?? 'Law24 User')
          .split(' ')
          .map((part: string) => part[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
      };
      set({
        token: storedToken,
        accessToken: storedToken,
        isLoggedIn: true,
        isAuthenticated: true,
        user,
      });
    } catch {
      await clearAccessToken();
      set({
        token: null,
        accessToken: null,
        isLoggedIn: false,
        isAuthenticated: false,
        user: null,
      });
    } finally {
      set({ restoringSession: false });
    }
  },
  logout: async () => {
    await clearAccessToken();
    set({
      token: null,
      accessToken: null,
      isLoggedIn: false,
      isAuthenticated: false,
      user: null,
    });
  },
  setWhatsapp: (val)  => set({ whatsappUpdates: val }),
}));
