import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  isHydrated: boolean;
  user: User | null;
  accessToken: string | null;
  restoringSession: boolean;
  whatsappUpdates: boolean;
  hydrate:        () => Promise<void>;
  setUser:        (user: any) => void;
  login:          (user: User, accessToken?: string) => Promise<void>;
  restoreSession: () => Promise<void>;
  logout:         () => Promise<void>;
  setWhatsapp:    (val: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  isLoggedIn: false,
  isAuthenticated: false,
  isHydrated: false,
  user: null,
  accessToken: null,
  restoringSession: false,
  whatsappUpdates: true,

  hydrate: async () => {
    try {
      const token = await AsyncStorage.getItem("law24_access_token");
      console.log("[Law24] HYDRATE TOKEN:", token ? "found" : "none");
      if (token) {
        set({
          token,
          accessToken: token,
          isLoggedIn: true,
          isAuthenticated: true,
          isHydrated: true,
        });
      } else {
        set({ isHydrated: true });
      }
    } catch {
      set({ isHydrated: true });
    }
  },

  setUser: (user: any) => {
    set({
      user,
      token: user.token,
      accessToken: user.token,
      isLoggedIn: !!user.token,
      isAuthenticated: !!user.token,
      isHydrated: true,
    });
    console.log("AUTH STATE:", get());
  },

  login: async (user, accessToken) => {
    if (accessToken) {
      await saveAccessToken(accessToken);
    }
    set({
      token: accessToken ?? null,
      accessToken: accessToken ?? null,
      isLoggedIn: !!accessToken,
      isAuthenticated: !!accessToken,
      isHydrated: true,
      user,
    });
  },

  restoreSession: async () => {
    set({ restoringSession: true });
    try {
      await get().hydrate();
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
      isHydrated: true,
    });
  },
  
  setWhatsapp: (val)  => set({ whatsappUpdates: val }),
}));
