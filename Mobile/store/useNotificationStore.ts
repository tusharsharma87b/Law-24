/**
 * Notification store — Zustand.
 * Holds all in-app notifications, supports mark-as-read, badge count,
 * and a `sendNotification` helper ready for push notification integration.
 *
 * Future push integration: call sendNotification() from a Firebase
 * onMessage handler or Expo Notifications listener.
 */
import { create } from 'zustand';

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationType = 'case' | 'document' | 'general' | 'lawyer' | 'payment';
export type NotificationPriority = 'high' | 'medium' | 'low';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  /** ISO date string or 'Today' / 'Yesterday' label */
  date: string;
  priority: NotificationPriority;
  read: boolean;
  /** Optional deep-link target used by action handler */
  targetRoute?: string;
  targetParams?: Record<string, string>;
  createdAt: number; // epoch ms — used for sorting
}

// ─── Accent config (type → colour + icon) ─────────────────────────────────────

export type NotificationMeta = { color: string; icon: string };

export const NOTIFICATION_META: Record<NotificationType, NotificationMeta> = {
  case:     { color: '#EF4444', icon: 'gavel' },
  document: { color: '#F59E0B', icon: 'description' },
  general:  { color: '#22C55E', icon: 'info' },
  lawyer:   { color: '#4F6BFF', icon: 'people' },
  payment:  { color: '#A78BFA', icon: 'account-balance-wallet' },
};

// ─── Mock seed data ────────────────────────────────────────────────────────────

const now = Date.now();
const DAY = 86_400_000;

const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    type: 'case',
    title: 'Hearing Reminder',
    message: 'Your next hearing is scheduled in 2 days — Karnataka High Court',
    date: 'Today',
    priority: 'high',
    read: false,
    targetRoute: '/(tabs)/cases',
    createdAt: now - 5 * 60_000,
  },
  {
    id: 'n2',
    type: 'case',
    title: 'Case Updated',
    message: 'Adv. Anjali Kapoor updated your property dispute case notes',
    date: 'Today',
    priority: 'high',
    read: false,
    targetRoute: '/(tabs)/cases',
    createdAt: now - 30 * 60_000,
  },
  {
    id: 'n3',
    type: 'lawyer',
    title: 'Lawyer Online',
    message: 'Adv. Rahul Mehta is now available for a chat session',
    date: 'Today',
    priority: 'medium',
    read: false,
    // Deep-link directly to Rahul Mehta's profile, not the generic lawyers list
    targetRoute: '/lawyer/LAW-002',
    createdAt: now - 60 * 60_000,
  },
  {
    id: 'n4',
    type: 'document',
    title: 'Document Required',
    message: 'Please upload the sale agreement for Adv. Anjali\'s review',
    date: 'Today',
    priority: 'medium',
    read: false,
    targetRoute: '/(tabs)/documents',
    createdAt: now - 3 * 60 * 60_000,
  },
  {
    id: 'n5',
    type: 'document',
    title: 'Action Pending',
    message: 'Your lawyer is waiting for the signed affidavit — submit before tomorrow',
    date: 'Today',
    priority: 'medium',
    read: false,
    targetRoute: '/(tabs)/documents',
    createdAt: now - 5 * 60 * 60_000,
  },
  {
    id: 'n6',
    type: 'payment',
    title: 'Payment Receipt',
    message: 'Chat session with Adv. Rahul Mehta — ₹450 deducted',
    date: 'Yesterday',
    priority: 'low',
    read: true,
    targetRoute: '/(tabs)/profile',
    createdAt: now - DAY - 2 * 60 * 60_000,
  },
  {
    id: 'n7',
    type: 'general',
    title: 'Premium Expiring Soon',
    message: 'Your Premium Pro plan expires in 3 days — renew to keep access',
    date: 'Yesterday',
    priority: 'low',
    read: false,
    targetRoute: '/(tabs)/profile',
    createdAt: now - DAY - 6 * 60 * 60_000,
  },
  {
    id: 'n8',
    type: 'case',
    title: 'New Judgment Available',
    message: 'NyayaAI found a relevant judgment that may help your property case',
    date: 'Yesterday',
    priority: 'high',
    read: true,
    targetRoute: '/nyaya',
    createdAt: now - DAY - 10 * 60 * 60_000,
  },
];

// ─── Store ────────────────────────────────────────────────────────────────────

interface NotificationState {
  notifications: AppNotification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (n: AppNotification) => void;
  dismissNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: MOCK_NOTIFICATIONS,

  markAsRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      ),
    })),

  markAllAsRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    })),

  addNotification: (notification) =>
    set((s) => ({
      notifications: [notification, ...s.notifications],
    })),

  dismissNotification: (id) =>
    set((s) => ({
      notifications: s.notifications.filter((n) => n.id !== id),
    })),

  clearAll: () => set({ notifications: [] }),
}));

// ─── Badge helper ──────────────────────────────────────────────────────────────

export function useUnreadCount() {
  return useNotificationStore((s) =>
    s.notifications.filter((n) => !n.read).length,
  );
}

// ─── sendNotification — push-notification-ready helper ───────────────────────
/**
 * Call this from:
 *  - Expo Notifications `addNotificationReceivedListener`
 *  - Firebase Cloud Messaging `onMessage`
 *  - Any background job / socket event
 *
 * Example:
 *   sendNotification('case', 'Next hearing in 2 days', {
 *     title: 'Hearing Reminder',
 *     targetRoute: '/(tabs)/cases',
 *   });
 */
let _nextId = 1000;
export function sendNotification(
  type: NotificationType,
  message: string,
  opts: Partial<Pick<AppNotification, 'title' | 'priority' | 'targetRoute' | 'targetParams'>> = {},
) {
  const notification: AppNotification = {
    id: `push-${++_nextId}`,
    type,
    title: opts.title ?? type.charAt(0).toUpperCase() + type.slice(1),
    message,
    date: 'Today',
    priority: opts.priority ?? 'medium',
    read: false,
    targetRoute: opts.targetRoute,
    targetParams: opts.targetParams,
    createdAt: Date.now(),
  };
  useNotificationStore.getState().addNotification(notification);
  return notification;
}

/** Simulate the two smart reminders from the spec */
export function simulateCaseReminder() {
  return sendNotification('case', 'Next hearing in 2 days — Karnataka High Court', {
    title: 'Hearing Reminder',
    priority: 'high',
    targetRoute: '/(tabs)/cases',
  });
}

export function simulateDocumentReminder() {
  return sendNotification('document', 'Your lawyer is waiting for your document', {
    title: 'Action Pending',
    priority: 'medium',
    targetRoute: '/(tabs)/documents',
  });
}
