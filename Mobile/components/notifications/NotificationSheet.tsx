/**
 * NotificationSheet
 * • Drag handle down  → sheet follows finger; dismiss at 100px or velocity > 0.5
 * • Drag not far enough → snaps back with spring
 * • Tap notification → marks read + closes + routes to the correct tab
 * • Long-press → marks read in-place (no navigation)
 * • Mark all read button in header
 */
import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import {
  Animated,
  FlatList,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
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
    <Text style={ns.emptyTitle}>You're all caught up!</Text>
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
  const { height: screenH } = useWindowDimensions();
  const sheetH = Math.round(screenH * 0.70);

  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();
  const router = useRouter();

  // ── Animation values ──────────────────────────────────────────────────────
  const slideAnim   = useRef(new Animated.Value(sheetH)).current; // 0 = fully open
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const dragY        = useRef(new Animated.Value(0)).current;     // drag delta
  const [mounted, setMounted] = useState(false);
  const isClosing = useRef(false);

  // ── Open / close animation ────────────────────────────────────────────────
  useEffect(() => {
    if (visible) {
      isClosing.current = false;
      setMounted(true);
      dragY.setValue(0);
      slideAnim.setValue(sheetH);
      backdropAnim.setValue(0);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0, useNativeDriver: true, speed: 22, bounciness: 2,
        }),
        Animated.timing(backdropAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      if (isClosing.current) return;
      isClosing.current = true;
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: sheetH, duration: 220, useNativeDriver: true }),
        Animated.timing(backdropAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished) { setMounted(false); dragY.setValue(0); }
      });
    }
  }, [visible, sheetH]);

  // ── Drag-to-dismiss (PanResponder on the handle zone) ─────────────────────
  const DISMISS_THRESHOLD = 100; // px to drag before snap-dismiss

  const panResponder = useRef(
    PanResponder.create({
      // Only claim gesture if moving downward
      onMoveShouldSetPanResponder: (_, { dy, dx }) =>
        dy > 6 && Math.abs(dy) > Math.abs(dx),
      onPanResponderGrant: () => {
        dragY.setOffset((dragY as any).__getValue());
        dragY.setValue(0);
      },
      onPanResponderMove: (_, { dy }) => {
        // Only drag downward
        dragY.setValue(Math.max(0, dy));
      },
      onPanResponderRelease: (_, { dy, vy }) => {
        dragY.flattenOffset();
        const finalDy = (dragY as any).__getValue();
        if (finalDy > DISMISS_THRESHOLD || vy > 0.5) {
          // Dismiss: slide the rest of the way out
          isClosing.current = true;
          Animated.parallel([
            Animated.timing(dragY, {
              toValue: sheetH, duration: 200, useNativeDriver: true,
            }),
            Animated.timing(backdropAnim, {
              toValue: 0, duration: 200, useNativeDriver: true,
            }),
          ]).start(({ finished }) => {
            if (finished) {
              dragY.setValue(0);
              setMounted(false);
              onClose();
            }
          });
        } else {
          // Not far enough — snap back
          Animated.spring(dragY, {
            toValue: 0, useNativeDriver: true, speed: 20, bounciness: 8,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(dragY, {
          toValue: 0, useNativeDriver: true, speed: 20, bounciness: 8,
        }).start();
      },
    }),
  ).current;

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
      // Close sheet first, then navigate
      isClosing.current = true;
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: sheetH, duration: 200, useNativeDriver: true }),
        Animated.timing(backdropAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start(() => {
        setMounted(false);
        dragY.setValue(0);
        onClose();
        try {
          router.push(route as any);
        } catch { /* route may not exist in dev */ }
      });
    },
    [markAsRead, onClose, router, slideAnim, backdropAnim, dragY, sheetH],
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

  if (!mounted) return null;

  // Combined translateY: open/close slide + finger drag
  const combinedY = Animated.add(slideAnim, dragY);

  // Backdrop dims as user drags down
  const backdropOpacity = Animated.multiply(
    backdropAnim,
    dragY.interpolate({
      inputRange: [0, DISMISS_THRESHOLD * 2],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    }),
  );

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      {/* Dim overlay */}
      <Animated.View
        style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.55)', opacity: backdropOpacity }]}
        pointerEvents="none"
      />
      {/* Tap-outside-to-close */}
      <TouchableOpacity
        style={StyleSheet.absoluteFillObject}
        onPress={onClose}
        activeOpacity={1}
        accessible={false}
      />

      {/* Sheet panel */}
      <Animated.View
        style={[ns.sheet, { height: sheetH, transform: [{ translateY: combinedY }] }]}
        pointerEvents="auto"
      >
        {/* ── Draggable handle ── */}
        <View style={ns.handleZone} {...panResponder.panHandlers}>
          <View style={ns.handle} />
          <Text style={ns.dragHint}>drag down to close</Text>
        </View>

        {/* ── Header ── */}
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

        {/* ── Notification list ── */}
        <FlatList
          data={listItems}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={ns.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState />}
          keyboardShouldPersistTaps="handled"
        />
      </Animated.View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const ns = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#111827',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
  },

  // Drag handle zone — tall enough for easy finger targeting
  handleZone: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
    gap: 3,
  },
  handle: {
    width: 44, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  dragHint: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.2)',
    letterSpacing: 0.5,
    fontStyle: 'italic',
  },

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
