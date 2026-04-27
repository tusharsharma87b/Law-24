import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Linking,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from './AppIcon';

const OFFICE_EMERGENCY_NUMBER = '+919999999999';
type UrgencyType = 'urgent' | 'not urgent';
type CategoryType = 'Criminal' | 'Family' | 'General';
type EmergencyLead = {
  type: UrgencyType;
  category: CategoryType;
  hour: number;
  isNight: boolean;
  sourceScreen: string;
  route: 'FASTEST_AVAILABLE_LAWYER' | 'CATEGORY_SPECIALIST' | 'GENERAL_QUEUE';
  timestamp: Date;
  time: string;
  source: 'Emergency FAB';
};

export function FloatingFAB() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const [openEmergency, setOpenEmergency] = useState(false);
  const [selectedUrgency, setSelectedUrgency] = useState<UrgencyType>('urgent');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('General');
  const [connecting, setConnecting] = useState(false);
  const [priorityNote, setPriorityNote] = useState('');
  const [leads, setLeads] = useState<EmergencyLead[]>([]);
  const lastSelectedCategory = useRef<CategoryType | null>(null);
  const callTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const currentPan = useRef({ x: 0, y: 0 });
  const dragStart = useRef({ x: 0, y: 0 });
  const FAB_SIZE = 56;
  const BASE_RIGHT = 16;
  const BASE_BOTTOM = 96;
  const BASE_X = Math.max(8, width - FAB_SIZE - BASE_RIGHT);
  const BASE_Y = Math.max(8, height - FAB_SIZE - BASE_BOTTOM);
  const MIN_X = 8;
  const MAX_X = Math.max(8, width - FAB_SIZE - 8);
  const MIN_Y = 80;
  const MAX_Y = Math.max(120, height - FAB_SIZE - 90);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        dragStart.current = { ...currentPan.current };
      },
      onPanResponderMove: (_, gestureState) => {
        const rawX = BASE_X + dragStart.current.x + gestureState.dx;
        const rawY = BASE_Y + dragStart.current.y + gestureState.dy;
        const clampedX = Math.min(Math.max(rawX, MIN_X), MAX_X);
        const clampedY = Math.min(Math.max(rawY, MIN_Y), MAX_Y);
        const nextPan = { x: clampedX - BASE_X, y: clampedY - BASE_Y };
        currentPan.current = nextPan;
        pan.setValue(nextPan);
      },
      onPanResponderRelease: () => {
        dragStart.current = { ...currentPan.current };
      },
      onPanResponderTerminate: () => {
        dragStart.current = { ...currentPan.current };
      },
    })
  ).current;

  // Critical Android gesture safety:
  // disable FAB interactions on case forms/details so it never steals vertical scroll touches.
  const disableFabForCaseFlows =
    pathname?.includes('/(tabs)/cases') ||
    pathname?.includes('/case/');

  const toggleMenu = () => {
    setOpenEmergency(false);
    setOpen((v) => !v);
  };
  const closeAll = () => {
    setOpen(false);
    setOpenEmergency(false);
  };

  const handleAI = () => {
    closeAll();
    router.push('/nyaya');
  };

  const handleEmergency = () => {
    setOpen(false);
    setOpenEmergency(true);
  };

  const getAutoTags = (category: CategoryType | null) => {
    const now = new Date();
    const hour = now.getHours();
    const isNight = hour < 6 || hour > 22;
    const screenName = pathname
      .split('/')
      .filter(Boolean)
      .pop() || 'Home';

    return {
      time: now.toISOString(),
      hour,
      isNight,
      category: category || 'General',
      sourceScreen: screenName,
    };
  };

  const getPriority = (tags: ReturnType<typeof getAutoTags>) => {
    let priority: 'normal' | 'medium' | 'high' = 'normal';
    if (tags.category === 'Criminal') priority = 'high';
    if (tags.isNight) priority = 'high';
    if (tags.category === 'Family') priority = 'medium';
    return priority;
  };

  const routeCall = (tags: ReturnType<typeof getAutoTags>) => {
    const priority = getPriority(tags);
    if (priority === 'high') return 'FASTEST_AVAILABLE_LAWYER' as const;
    if (priority === 'medium') return 'CATEGORY_SPECIALIST' as const;
    return 'GENERAL_QUEUE' as const;
  };

  const handleCall = () => {
    const tags = getAutoTags(lastSelectedCategory.current);
    const route = routeCall(tags);
    const highPriority = route === 'FASTEST_AVAILABLE_LAWYER';
    const note = highPriority
      ? tags.isNight
        ? 'Late night support activated'
        : 'High Priority Case'
      : '';

    setPriorityNote(note);
    setConnecting(true);
    setOpenEmergency(false);

    const lead: EmergencyLead = {
      type: selectedUrgency,
      category: tags.category as CategoryType,
      hour: tags.hour,
      isNight: tags.isNight,
      sourceScreen: tags.sourceScreen,
      route,
      timestamp: new Date(),
      time: tags.time,
      source: 'Emergency FAB',
    };

    console.log('EMERGENCY LEAD:', lead);
    setLeads((prev) => [lead, ...prev]);

    if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);
    callTimeoutRef.current = setTimeout(() => {
      Linking.openURL(`tel:${OFFICE_EMERGENCY_NUMBER}`).catch(() => {});
      setConnecting(false);
      setPriorityNote('');
    }, 1500);
  };

  return (
    <View pointerEvents={disableFabForCaseFlows ? 'none' : 'box-none'} style={styles.root}>
      {open || openEmergency ? <Pressable style={styles.overlay} onPress={closeAll} /> : null}

      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.fabContainer,
          { bottom: BASE_BOTTOM, right: BASE_RIGHT },
          {
            transform: pan.getTranslateTransform(),
          },
        ]}
        pointerEvents={disableFabForCaseFlows ? 'none' : 'auto'}
      >
        <TouchableOpacity onPress={toggleMenu} style={styles.fab} activeOpacity={0.85}>
          <AppIcon name="sparkles" size={22} color="#FFFFFF" strokeWidth={2.2} />
        </TouchableOpacity>

        {open && (
          <View style={styles.menuContainer}>
            <TouchableOpacity onPress={handleEmergency} activeOpacity={0.85} style={styles.menuItem}>
              <Text style={styles.menuTitle}>Call Lawyer</Text>
              <Text style={styles.menuSub}>Emergency • Free support</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity onPress={handleAI} activeOpacity={0.85} style={styles.menuItem}>
              <Text style={styles.menuTitle}>Ask Nyaya AI</Text>
              <Text style={styles.menuSub}>Instant legal guidance</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
      {openEmergency ? (
        <View style={styles.sheetWrapper}>
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}>
            <Text style={styles.title}>Emergency Legal Help</Text>
            <Text style={styles.sub}>Connect to our 24×7 helpline instantly</Text>

            <View style={styles.tagRow}>
              <TouchableOpacity
                style={selectedUrgency === 'urgent' ? styles.tagActive : styles.tag}
                onPress={() => setSelectedUrgency('urgent')}
                activeOpacity={0.8}
              >
                <Text style={styles.tagText}>Urgent</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={selectedUrgency === 'not urgent' ? styles.tagActive : styles.tag}
                onPress={() => setSelectedUrgency('not urgent')}
                activeOpacity={0.8}
              >
                <Text style={styles.tagText}>Not urgent</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.timeSlots}>
              {(['Criminal', 'Family', 'General'] as CategoryType[]).map((category) => {
                const active = selectedCategory === category;
                return (
                  <TouchableOpacity
                    key={category}
                    style={active ? styles.catActive : styles.cat}
                    onPress={() => {
                      setSelectedCategory(category);
                      lastSelectedCategory.current = category;
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.catText}>{category}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.secondaryBtn, { flex: 1 }]} onPress={closeAll} activeOpacity={0.8}>
                <Text style={styles.secondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.primaryBtn, { flex: 1 }]} onPress={handleCall} activeOpacity={0.8}>
                <Text style={styles.primaryText}>📞 Call Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : null}

      {connecting ? (
        <View style={styles.connectingOverlay}>
          <Text style={styles.connectingTitle}>Connecting you to a lawyer...</Text>
          <Text style={styles.connectingSub}>
            {priorityNote || 'Finding best available expert'}
          </Text>
          <ActivityIndicator size="large" color="#5B6EF5" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 40,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  fabContainer: {
    position: 'absolute',
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 40,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#5B6EF5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  menuContainer: {
    position: 'absolute',
    bottom: 72,
    right: 0,
    width: 200,
    backgroundColor: '#111827',
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
  },
  menuItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  menuTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  menuSub: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 4,
  },
  sheet: {
    width: '92%',
    maxWidth: 500,
    maxHeight: '45%',
    backgroundColor: '#0B1220',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  sheetWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sub: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
  },
  tagRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#1F2937',
    marginRight: 8,
  },
  tagActive: {
    backgroundColor: '#5B6EF5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  tagText: {
    color: '#FFF',
    fontSize: 11,
  },
  timeSlots: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  cat: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#1F2937',
    marginRight: 8,
  },
  catActive: {
    backgroundColor: 'rgba(91,110,245,0.35)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  catText: {
    color: '#FFF',
    fontSize: 11,
  },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  primaryBtn: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#5B6EF5',
  },
  primaryText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryBtn: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1F2937',
  },
  secondaryText: {
    color: '#D1D5DB',
    fontSize: 14,
    fontWeight: '500',
  },
  connectingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectingTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  connectingSub: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 6,
    marginBottom: 20,
  },
});

