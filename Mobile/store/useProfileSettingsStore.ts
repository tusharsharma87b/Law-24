import { create } from 'zustand';

export type DeviceSession = {
  id: string;
  deviceName: string;
  platform: string;
  location: string;
  lastActive: string;
  current: boolean;
};

export type LoginEvent = {
  id: string;
  deviceName: string;
  location: string;
  ip: string;
  time: string;
  status: 'SUCCESS' | 'FAILED';
};

export type Invoice = {
  id: string;
  title: string;
  amount: number;
  createdAt: string;
  status: 'PAID' | 'REFUNDED';
  downloadUrl: string;
};

type ProfileSettingsState = {
  twoFAEnabled: boolean;
  dataSharingEnabled: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  autoRechargeEnabled: boolean;
  devices: DeviceSession[];
  loginHistory: LoginEvent[];
  invoices: Invoice[];
  setTwoFAEnabled: (enabled: boolean) => Promise<void>;
  setDataSharingEnabled: (enabled: boolean) => Promise<void>;
  setNotificationPrefs: (prefs: { push: boolean; email: boolean; sms: boolean }) => Promise<void>;
  setAutoRechargeEnabled: (enabled: boolean) => Promise<void>;
  logoutDevice: (deviceId: string) => Promise<void>;
  addInvoice: (invoice: Invoice) => void;
};

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const useProfileSettingsStore = create<ProfileSettingsState>((set) => ({
  twoFAEnabled: false,
  dataSharingEnabled: false,
  pushNotifications: true,
  emailNotifications: true,
  smsNotifications: false,
  autoRechargeEnabled: false,
  devices: [
    { id: 'd1', deviceName: 'Chrome on Windows', platform: 'Web', location: 'Delhi', lastActive: 'Just now', current: true },
    { id: 'd2', deviceName: 'Pixel 8', platform: 'Android', location: 'Mumbai', lastActive: '2 hours ago', current: false },
  ],
  loginHistory: [
    { id: 'l1', deviceName: 'Chrome on Windows', location: 'Delhi', ip: '49.37.121.40', time: 'Today, 7:12 PM', status: 'SUCCESS' },
    { id: 'l2', deviceName: 'Pixel 8', location: 'Mumbai', ip: '103.122.1.18', time: 'Yesterday, 10:44 PM', status: 'SUCCESS' },
    { id: 'l3', deviceName: 'Unknown Device', location: 'Lucknow', ip: '182.70.8.22', time: '2 days ago', status: 'FAILED' },
  ],
  invoices: [
    {
      id: 'INV-1001',
      title: 'Consultation with Adv. Rahul Mehta',
      amount: 450,
      createdAt: '2026-04-24T11:10:00.000Z',
      status: 'PAID',
      downloadUrl: 'https://example.com/invoice/INV-1001.pdf',
    },
  ],

  setTwoFAEnabled: async (enabled) => {
    await wait(500);
    set({ twoFAEnabled: enabled });
  },

  setDataSharingEnabled: async (enabled) => {
    await wait(500);
    set({ dataSharingEnabled: enabled });
  },

  setNotificationPrefs: async ({ push, email, sms }) => {
    await wait(500);
    set({ pushNotifications: push, emailNotifications: email, smsNotifications: sms });
  },

  setAutoRechargeEnabled: async (enabled) => {
    await wait(400);
    set({ autoRechargeEnabled: enabled });
  },

  logoutDevice: async (deviceId) => {
    await wait(600);
    set((state) => ({
      devices: state.devices.filter((device) => device.id === 'd1' || device.id !== deviceId),
    }));
  },

  addInvoice: (invoice) => {
    set((state) => ({ invoices: [invoice, ...state.invoices] }));
  },
}));

