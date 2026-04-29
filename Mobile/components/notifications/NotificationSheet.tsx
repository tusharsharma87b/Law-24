/**
 * NotificationSheet
 * • Drag handle down  → sheet follows finger; dismiss at 100px or velocity > 0.5
 * • Drag not far enough → snaps back with spring
 * • Tap notification → marks read + closes + routes to the correct tab
 * • Long-press → marks read in-place (no navigation)
 * • Mark all read button in header
 */
import React, {
  useCallback, useEffect, useMemo, useRef,
} from 'react';
import {
  Animated,
  BackHandler,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import {
  NOTIFICATION_META,
  useNotificationStore,
  type AppNotification,
  type NotificationType,
} from '../../store/useNotificationStore';
import { BottomSheetWrapper } from '../ui/BottomSheetWrapper';

// ─── Destination labels ───────────────────────────────────────────────────────

/** Returns a human-readable "Tap to open …" label for a notification */
function getDestinationLabel(n: AppNotification): string {
  // Lawyer notification with a profile deep-link → show lawyer name from message
  if (n.type === 'lawyer' && n.targetRoute?.startsWith('/lawyer/')) {
    // Extract "Adv. Rahul Mehta" from "Adv. Rahul Mehta is now available…"
    const match = n.message.match(/^(Adv\.\s[\w\s]+?)(?:\sis|\s–|$)/);
    if (match) return `View ${match[1].trim()}`;
    return 'View Lawyer Profile';
  }
  const labels: Record<NotificationType, string> = {
    case: 'Cases',
    document: 'Documents',
    lawyer: 'Lawyers',
    payment: 'Wallet',
    general: 'Profile',
  };
  return labels[n.type] ?? 'Open';
}

function getDestinationIcon(n: AppNotification): string {
  if (n.type === 'lawyer' && n.targetRoute?.startsWith('/lawyer/')) return 'person';
  const icons: Record<NotificationType, string> = {
    case: 'gavel',
    document: 'folder',
    lawyer: 'people',
    payment: 'account-balance-wallet',
    general: 'person',
  };
  return icons[n.type] ?? 'open-in-new';
}

/** Returns the exact route for a notification — always honours targetRoute first */
function resolveRoute(n: AppNotification): string {
  if (n.targetRoute) return n.targetRoute;
  switch (n.type) {
    case 'case':     return '/(tabs)/cases';
    case 'document': return '/(tabs)/documents';
    case 'lawyer':   return '/(tabs)/lawyers';
    case 'payment':  return '/(tabs)/profile';
    default:         return '/(tabs)/profile';
  }
}

// ─── Single notification row ──────────────────────────────────────────────────

type RowProps = {
  item: AppNotification;
  onPress: (n: AppNotification) => void;
  onMarkRead: (id: string) => void;
};

const NotificationRow = React.memo(function NotificationRow({
  item, onPress, onMarkRead,
}: RowProps) {
  const meta = NOTIFICATION_META[item.type];
  const destLabel = getDestinationLabel(item);
  const destIcon  = getDestinationIcon(item);
  const flashAnim = useRef(new Animated.Value(1)).current;

  const handleLongPress = useCallback(() => {
    if (item.read) return;
    // Quick flash + mark
    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 0.3, duration: 100, useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 1,   duration: 100, useNativeDriver: true }),
    ]).start(() => onMarkRead(item.id));
  }, [item.read, item.id, flashAnim, onMarkRead]);

  return (
    <Animated.View style={{ opacity: flashAnim }}>
      <TouchableOpacity
        style={[ns.row, !item.read && ns.rowUnread]}
        onPress={() => onPress(item)}
        onLongPress={handleLongPress}
        activeOpacity={0.82}
        delayLongPress={400}
      >
        {/* Blue unread dot */}
        {!item.read && <View style={ns.unreadDot} />}

        {/* Coloured icon */}
        <View style={[ns.iconWrap, { backgroundColor: meta.color + '22' }]}>
          <MaterialIcons name={meta.icon as any} size={20} color={meta.color} />
        </View>

        {/* Text content */}
        <View style={ns.content}>
          <View style={ns.titleRow}>
            <Text
              style={[ns.title, !item.read && ns.titleUnread]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text style={ns.date}>{item.date}</Text>
          </View>
          <Text style={ns.message} numberOfLines={2}>{item.message}</Text>

          {/* Destination badge — shows where tapping will take the user */}
          <View style={ns.destRow}>
            <MaterialIcons name={destIcon as any} size={11} color={meta.color} />
            <Text style={[ns.destTxt, { color: meta.color }]}>
              Tap to open {destLabel}
            </Text>
            <MaterialIcons name="arrow-forward" size={11} color={meta.color} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

// ─── Section label ────────────────────────────────────────────────────────────

const SectionLabel = React.memo(function SectionLabel({ label }: { label: string }) {
  return (
    <View style={ns.sectionLabel}>
      <Text style={ns.sectionTxt}>{label}</Text>
    </View>
  );
});

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState = () => (
  <View style={ns.empty}>
    <Text style={ns.emptyEmoji}>🎉</Text>
    <Text style={ns.emptyTitle}>You are all caught up!</Text>
    <Text style={ns.emptySub}>No new notifications right now.</Text>
  </View>
);

// ─── Sheet ────────────────────────────────────────────────────────────────────

type SheetItem =
  | { kind: 'section'; label: string; id: string }
  | { kind: 'notification'; data: AppNotification };

export function NotificationSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();
  const router = useRouter();
  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [visible, onClose]);

  // ── Data ──────────────────────────────────────────────────────────────────
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const listItems = useMemo<SheetItem[]>(() => {
    const today   = notifications.filter((n) => n.date === 'Today');
    const earlier = notifications.filter((n) => n.date !== 'Today');
    const items: SheetItem[] = [];
    if (today.length) {
      items.push({ kind: 'section', label: 'Today', id: 'sec-today' });
      today.forEach((n) => items.push({ kind: 'notification', data: n }));
    }
    if (earlier.length) {
      items.push({ kind: 'section', label: 'Earlier', id: 'sec-earlier' });
      earlier.forEach((n) => items.push({ kind: 'notification', data: n }));
    }
    return items;
  }, [notifications]);

  // ── Tap handler ───────────────────────────────────────────────────────────
  const handleNotificationPress = useCallback(
    (n: AppNotification) => {
      markAsRead(n.id);
      const route = resolveRoute(n);
      onClose();
      setTimeout(() => {
        try {
          router.push(route as any);
        } catch {}
      }, 120);
    },
    [markAsRead, onClose, router],
  );

  const renderItem = useCallback(
    ({ item }: { item: SheetItem }) => {
      if (item.kind === 'section') return <SectionLabel label={item.label} />;
      return (
        <NotificationRow
          item={item.data}
          onPress={handleNotificationPress}
          onMarkRead={markAsRead}
        />
      );
    },
    [handleNotificationPress, markAsRead],
  );

  const keyExtractor = useCallback((item: SheetItem) =>
    item.kind === 'section' ? item.id : item.data.id,
  []);

  return (
    <BottomSheetWrapper visible={visible} onClose={onClose} heightPercent={0.85} enableScroll={false}>
      <View style={ns.header}>
        <View>
          <Text style={ns.headerTitle}>Notifications</Text>
          {unreadCount > 0
            ? <Text style={ns.headerSub}>{unreadCount} unread · long-press to mark read</Text>
            : <Text style={ns.headerSub}>All caught up</Text>
          }
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity style={ns.markAllBtn} onPress={markAllAsRead} activeOpacity={0.8}>
            <MaterialIcons name="done-all" size={16} color={Colors.primary} />
            <Text style={ns.markAllTxt}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={ns.listWrap}>
        <FlatList
          data={listItems}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={ns.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState />}
          keyboardShouldPersistTaps="handled"
        />
      </View>
    </BottomSheetWrapper>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const ns = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  listWrap: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  headerSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  markAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingTop: 2 },
  markAllTxt: { fontSize: 13, color: Colors.primary, fontWeight: '600' },

  listContent: {
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    flexGrow: 1,
  },

  // Section divider
  sectionLabel: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 5 },
  sectionTxt: {
    fontSize: 10, fontWeight: '700',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },

  // Notification row
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  rowUnread: { backgroundColor: 'rgba(79,107,255,0.05)' },
  unreadDot: {
    position: 'absolute',
    left: 6, top: '50%',
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: -3,
  },
  iconWrap: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  content: { flex: 1, minWidth: 0, gap: 2 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: { flex: 1, fontSize: 14, fontWeight: '500', color: Colors.textSecondary },
  titleUnread: { fontWeight: '700', color: Colors.textPrimary },
  date: { fontSize: 11, color: Colors.textTertiary, flexShrink: 0 },
  message: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },

  // Destination badge
  destRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 5,
  },
  destTxt: { fontSize: 11, fontWeight: '600' },

  // Empty
  empty: { alignItems: 'center', paddingTop: 56, paddingBottom: 24, gap: 8 },
  emptyEmoji: { fontSize: 42 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  emptySub: { fontSize: 13, color: Colors.textSecondary },
});
