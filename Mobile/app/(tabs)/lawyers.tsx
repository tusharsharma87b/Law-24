/**
 * Lawyers directory — fully functional search, advanced filters, sort.
 * Mock DIRECTORY_LAWYERS today; swap for GET /lawyers + pagination later.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Keyboard,
  ListRenderItemInfo,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { LawyerDirectoryCard } from '../../components/lawyer/LawyerDirectoryCard';
import { Colors } from '../../constants/colors';
import {
  COURT_TYPE_LABEL,
  DIRECTORY_CATEGORY_LABEL,
  DIRECTORY_FILTER_KEYS,
  DIRECTORY_LAWYERS,
  WORKING_ON_PROFILE_IDS,
  filterDirectoryLawyers,
  parseDirectoryCategoryParam,
  sortDirectoryLawyers,
  type CourtType,
  type DirectoryCategory,
  type DirectoryFilters,
  type DirectoryLawyer,
  type LocationFilter,
  type PriceFilter,
  type RatingFilter,
  type SortKey,
} from '../../constants/lawyersDirectory';

import {
  generateSuggestions,
  type SearchSuggestion,
} from '../../constants/lawyerSearchSuggestions';
import {
  useLawyerFiltersStore,
  DEFAULT_SHEET_STORE
} from '../../store/useLawyerFiltersStore';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { useLawyerDataStore } from '../../store/useLawyerDataStore';

// ─── Constants ────────────────────────────────────────────────────────────────

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'rating', label: 'Top Rated' },
  { key: 'price', label: 'Lowest Price' },
  { key: 'response', label: 'Fastest' },
  { key: 'experience', label: 'Most Experienced' },
];

const LOCATION_OPTIONS: { value: LocationFilter; label: string }[] = [
  { value: 'all', label: 'All India' },
  { value: 'Delhi', label: 'Delhi' },
  { value: 'Mumbai', label: 'Mumbai' },
  { value: 'Bangalore', label: 'Bangalore' },
];

const RATING_OPTIONS: { value: RatingFilter; label: string }[] = [
  { value: 'any', label: 'Any' },
  { value: '4.0', label: '4.0+' },
  { value: '4.5', label: '4.5+' },
];

const COURT_OPTIONS: { value: CourtType | 'all'; label: string }[] = [
  { value: 'all', label: 'Any Court' },
  { value: 'district', label: 'District Court' },
  { value: 'high', label: 'High Court' },
  { value: 'supreme', label: 'Supreme Court' },
];

const PRICE_LABEL: Record<PriceFilter, string> = {
  any: '',
  under20: 'Under ₹20',
  under50: 'Under ₹50',
  '20to50': '₹20–₹50',
  above50: '₹50+',
};

const PRICE_OPTIONS: { value: PriceFilter; label: string }[] = [
  { value: 'any', label: 'Any' },
  { value: 'under20', label: '< ₹20' },
  { value: 'under50', label: '< ₹50' },
  { value: 'above50', label: '₹50+' },
];

type SheetFilters = {
  location: LocationFilter;
  rating: RatingFilter;
  price: PriceFilter;
  courtType: CourtType | 'all';
  onlineOnly: boolean;
};

// ─── Filter Sheet ─────────────────────────────────────────────────────────────

type FilterSheetProps = {
  visible: boolean;
  pending: SheetFilters;
  onChange: (f: SheetFilters) => void;
  onApply: () => void;
  onClear: () => void;
  onClose: () => void;
};

/** Compact option chips for use inside accordion sections */
function OptionRow<T extends string>({
  options,
  value,
  onSelect,
}: {
  options: { value: T; label: string }[];
  value: T;
  onSelect: (v: T) => void;
}) {
  return (
    <View style={sheetStyles.optRow}>
      {options.map((opt) => {
        const sel = opt.value === value;
        return (
          <TouchableOpacity
            key={opt.value}
            style={[sheetStyles.optChip, sel && sheetStyles.optChipSel]}
            onPress={() => onSelect(opt.value)}
            activeOpacity={0.8}
          >
            <Text style={[sheetStyles.optTxt, sel && sheetStyles.optTxtSel]}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/** Animated collapsible section */
function AccordionSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const anim = useRef(new Animated.Value(defaultOpen ? 1 : 0)).current;

  const toggle = useCallback(() => {
    const toValue = open ? 0 : 1;
    Animated.timing(anim, { toValue, duration: 180, useNativeDriver: false }).start();
    setOpen((o) => !o);
  }, [open, anim]);

  const maxHeight = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 200] });
  const chevron = anim.interpolate({ inputRange: [0, 1], outputRange: ['-90deg', '0deg'] });

  return (
    <View style={sheetStyles.accSection}>
      <TouchableOpacity style={sheetStyles.accHeader} onPress={toggle} activeOpacity={0.75}>
        <Text style={sheetStyles.accTitle}>{title}</Text>
        <Animated.View style={{ transform: [{ rotate: chevron }] }}>
          <MaterialIcons name="keyboard-arrow-down" size={18} color="#6B7280" />
        </Animated.View>
      </TouchableOpacity>
      <Animated.View style={[sheetStyles.accBody, { maxHeight }]}>
        <View style={sheetStyles.accContent}>{children}</View>
      </Animated.View>
    </View>
  );
}

const DISMISS_THRESHOLD = 90;

/**
 * Custom bottom sheet — no external library, runs on web + native.
 * UX parity with Amazon/Myntra:
 *  • Drag handle at top — pan down > 90 px or velocity > 0.5 → dismiss
 *  • Dim backdrop — tap outside → dismiss
 *  • Quick filters row (not scrollable)
 *  • ⚙️ Advanced accordion sections (scrollable)
 *  • Apply button pinned below ScrollView (never scrolls away)
 */
const FilterSheet = React.memo(function FilterSheet({
  visible,
  pending,
  onChange,
  onApply,
  onClear,
  onClose,
}: FilterSheetProps) {
  const { height: screenH } = useWindowDimensions();
  const sheetH = Math.round(screenH * 0.62);

  const slideAnim  = useRef(new Animated.Value(sheetH)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const dragY      = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(false);
  const isClosing  = useRef(false);

  // ── Open / close ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (visible) {
      isClosing.current = false;
      setMounted(true);
      dragY.setValue(0);
      slideAnim.setValue(sheetH);
      backdropAnim.setValue(0);
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, speed: 22, bounciness: 0 }),
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
  }, [visible, sheetH, dragY, slideAnim, backdropAnim]);

  // ── Drag-to-dismiss via PanResponder on the handle ────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dy, dx }) => dy > 6 && Math.abs(dy) > Math.abs(dx),
      onPanResponderGrant: () => {
        dragY.setOffset((dragY as any).__getValue());
        dragY.setValue(0);
      },
      onPanResponderMove: (_, { dy }) => { dragY.setValue(Math.max(0, dy)); },
      onPanResponderRelease: (_, { dy, vy }) => {
        dragY.flattenOffset();
        const finalDy = (dragY as any).__getValue();
        if (finalDy > DISMISS_THRESHOLD || vy > 0.5) {
          isClosing.current = true;
          Animated.parallel([
            Animated.timing(dragY,      { toValue: sheetH, duration: 200, useNativeDriver: true }),
            Animated.timing(backdropAnim, { toValue: 0,    duration: 200, useNativeDriver: true }),
          ]).start(({ finished }) => {
            if (finished) { dragY.setValue(0); setMounted(false); onClose(); }
          });
        } else {
          Animated.spring(dragY, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 8 }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(dragY, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 8 }).start();
      },
    }),
  ).current;

  const set = useCallback(<K extends keyof SheetFilters>(key: K, value: SheetFilters[K]) => {
    onChange({ ...pending, [key]: value });
  }, [pending, onChange]);

  if (!mounted && visible) return <LoadingScreen message="Opening filters..." />;
  if (!mounted) return <View pointerEvents="none" />;

  const quickRatingActive = pending.rating === '4.5';
  const quickBudgetActive = pending.price === 'under50';

  const combinedY   = Animated.add(slideAnim, dragY);
  const backdropOp  = Animated.multiply(
    backdropAnim,
    dragY.interpolate({ inputRange: [0, DISMISS_THRESHOLD * 2], outputRange: [1, 0], extrapolate: 'clamp' }),
  );

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      {/* Dim */}
      <Animated.View
        style={[StyleSheet.absoluteFillObject, sheetStyles.backdropDim, { opacity: backdropOp }]}
        pointerEvents="none"
      />
      {/* Tap outside → close */}
      <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={onClose} activeOpacity={1} accessible={false} />

      {/* Sheet */}
      <Animated.View
        style={[sheetStyles.sheet, { height: sheetH, transform: [{ translateY: combinedY }] }]}
        pointerEvents="auto"
      >
        {/* ── Draggable handle zone — tall hit-target, same as NotificationSheet ── */}
        <View style={sheetStyles.handleZone} {...panResponder.panHandlers}>
          <View style={sheetStyles.handlePill} />
          <Text style={sheetStyles.dragHint}>drag down to close</Text>
        </View>

        {/* ── Fixed header — also part of drag zone so users can grab it anywhere ── */}
        <View style={sheetStyles.sheetHeader} {...panResponder.panHandlers}>
          <Text style={sheetStyles.sheetTitle}>Filters</Text>
          <TouchableOpacity onPress={onClear} hitSlop={12} activeOpacity={0.7}>
            <Text style={sheetStyles.clearAll}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/* ── ⭐ Quick filters ── */}
        <View style={sheetStyles.quickSection}>
          <Text style={sheetStyles.sectionLabel}>⭐  QUICK FILTERS</Text>
          <View style={sheetStyles.quickRow}>
            <TouchableOpacity
              style={[sheetStyles.quickChip, quickRatingActive && sheetStyles.quickChipSel]}
              onPress={() => set('rating', quickRatingActive ? 'any' : '4.5')}
              activeOpacity={0.8}
            >
              <Text style={[sheetStyles.quickTxt, quickRatingActive && sheetStyles.quickTxtSel]}>⭐ 4.5+</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[sheetStyles.quickChip, pending.onlineOnly && sheetStyles.quickChipOnline]}
              onPress={() => set('onlineOnly', !pending.onlineOnly)}
              activeOpacity={0.8}
            >
              <Text style={[sheetStyles.quickTxt, pending.onlineOnly && sheetStyles.quickTxtOnline]}>🟢 Online</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[sheetStyles.quickChip, quickBudgetActive && sheetStyles.quickChipSel]}
              onPress={() => set('price', quickBudgetActive ? 'any' : 'under50')}
              activeOpacity={0.8}
            >
              <Text style={[sheetStyles.quickTxt, quickBudgetActive && sheetStyles.quickTxtSel]}>💰 Under ₹50</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── ⚙️ Advanced section divider ── */}
        <View style={sheetStyles.sectionDivider}>
          <Text style={sheetStyles.sectionLabel}>⚙️  ADVANCED FILTERS</Text>
        </View>

        {/* ── Scrollable accordion ── */}
        <ScrollView
          style={sheetStyles.scrollView}
          contentContainerStyle={sheetStyles.sheetScroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <AccordionSection title="Rating" defaultOpen>
            <OptionRow options={RATING_OPTIONS} value={pending.rating} onSelect={(v) => set('rating', v)} />
          </AccordionSection>
          <AccordionSection title="Cost per Minute" defaultOpen>
            <OptionRow options={PRICE_OPTIONS} value={pending.price} onSelect={(v) => set('price', v)} />
          </AccordionSection>
          <AccordionSection title="City" defaultOpen>
            <OptionRow options={LOCATION_OPTIONS} value={pending.location} onSelect={(v) => set('location', v)} />
          </AccordionSection>
          <AccordionSection title="Court Type">
            <OptionRow options={COURT_OPTIONS} value={pending.courtType} onSelect={(v) => set('courtType', v)} />
          </AccordionSection>
          <View style={sheetStyles.onlineSection}>
            <Text style={sheetStyles.accTitle}>Online Now Only</Text>
            <Switch
              value={pending.onlineOnly}
              onValueChange={(v) => set('onlineOnly', v)}
              trackColor={{ false: '#2D3748', true: 'rgba(79,107,255,0.45)' }}
              thumbColor={pending.onlineOnly ? '#4F6BFF' : '#9CA3AF'}
              style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
            />
          </View>
        </ScrollView>

        {/* ── Pinned Apply button ── */}
        <View style={sheetStyles.applyWrap}>
          <TouchableOpacity style={sheetStyles.applyBtn} onPress={onApply} activeOpacity={0.88}>
            <Text style={sheetStyles.applyTxt}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
});

// ─── Active Filter Chips ──────────────────────────────────────────────────────

type ActiveChip = { id: string; label: string; onRemove: () => void };

type ActiveChipsProps = {
  chips: ActiveChip[];
  onClearAll: () => void;
};

const ActiveFilterChips = React.memo(function ActiveFilterChips({ chips, onClearAll }: ActiveChipsProps) {
  if (chips.length === 0) return <View pointerEvents="none" style={{ height: 0 }} />;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.activeChipRow}
      style={styles.activeChipScroll}
    >
      {chips.map((chip) => (
        <TouchableOpacity key={chip.id} style={styles.activeChip} onPress={chip.onRemove} activeOpacity={0.8}>
          <Text style={styles.activeChipTxt}>{chip.label}</Text>
          <MaterialIcons name="close" size={13} color="#4F6BFF" style={{ marginLeft: 3 }} />
        </TouchableOpacity>
      ))}
      {chips.length > 1 && (
        <TouchableOpacity style={styles.clearAllChip} onPress={onClearAll} activeOpacity={0.8}>
          <Text style={styles.clearAllTxt}>Clear All</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
});

// ─── Category accent colours ──────────────────────────────────────────────────

const CAT_COLORS: Partial<Record<DirectoryCategory, string>> = {
  criminal: '#F85149',
  family: '#FF9F43',
  property: '#3FB950',
  employment: '#58A6FF',
  civil: '#F5A623',
  corporate: '#A78BFA',
  cyber: '#60A5FA',
  tax: '#34D399',
};

// ─── Google-style Suggestions Dropdown ───────────────────────────────────────

const SuggestionsDropdown = React.memo(function SuggestionsDropdown({
  suggestions,
  onSelect,
  onClose,
  visible,
  topOffset,
}: {
  suggestions: SearchSuggestion[];
  onSelect: (s: SearchSuggestion) => void;
  onClose: () => void;
  visible: boolean;
  topOffset: number;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [visible, fadeAnim]);

  if (!visible) return <View pointerEvents="none" style={dd.hidden} />;

  return (
    // No full-screen backdrop — relying on TextInput onBlur + FlatList scroll to close.
    // A backdrop would consume taps on lawyer cards, making them un-tappable while
    // the dropdown is open. Without backdrop: lawyer card taps still fire immediately;
    // dropdown closes automatically when the TextInput loses focus.
    <Animated.View style={[dd.container, { top: topOffset, opacity: fadeAnim }]}>
        {suggestions.map((s, idx) => {
          const accentColor = s.category ? (CAT_COLORS[s.category] ?? '#4F6BFF') : '#4F6BFF';
          return (
            <TouchableOpacity
              key={s.id}
              style={[dd.row, idx < suggestions.length - 1 && dd.rowBorder]}
              onPress={() => onSelect(s)}
              activeOpacity={0.8}
            >
              {/* Icon */}
              <View style={[dd.iconWrap, { backgroundColor: accentColor + '22' }]}>
                <MaterialIcons name={s.icon as any} size={15} color={accentColor} />
              </View>

              {/* Text */}
              <View style={dd.textWrap}>
                <Text style={dd.displayTxt} numberOfLines={1}>{s.display}</Text>
                {s.sub ? <Text style={dd.subTxt} numberOfLines={1}>{s.sub}</Text> : null}
              </View>

              {/* Category pill */}
              {s.category ? (
                <View style={[dd.catPill, { backgroundColor: accentColor + '20' }]}>
                  <Text style={[dd.catTxt, { color: accentColor }]}>
                    {DIRECTORY_CATEGORY_LABEL[s.category]}
                  </Text>
                </View>
              ) : (
                <MaterialIcons name="north-west" size={14} color="#4B5563" />
              )}
            </TouchableOpacity>
          );
        })}
    </Animated.View>
  );
});

// ─── Scroll-safe Sort + Category Chips ───────────────────────────────────────
// Uses a scroll-state guard so that dragging through chips doesn't accidentally
// toggle a category. A 50 ms pressIn delay + isScrolling ref together prevent
// finger-lift / mouse-cursor landing from being treated as an intentional tap.

// Sort chips
const SortChipsRow = React.memo(function SortChipsRow({
  sort,
  onSortChange,
}: {
  sort: SortKey;
  onSortChange: (s: SortKey) => void;
}) {
  const scrolling = useRef(false);
  const scrollEndTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const markScrollEnd = useCallback(() => {
    clearTimeout(scrollEndTimer.current);
    scrollEndTimer.current = setTimeout(() => { scrolling.current = false; }, 180);
  }, []);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.sortRow}
      style={styles.sortScroll}
      keyboardShouldPersistTaps="always"
      onScrollBeginDrag={() => { scrolling.current = true; }}
      onScrollEndDrag={markScrollEnd}
      onMomentumScrollEnd={() => { scrolling.current = false; }}
    >
      {SORT_OPTIONS.map((opt) => {
        const sel = sort === opt.key;
        return (
          <TouchableOpacity
            key={opt.key}
            style={[styles.sortChip, sel && styles.sortChipSel]}
            onPress={() => { if (!scrolling.current) onSortChange(opt.key); }}
            delayPressIn={50}
            activeOpacity={0.8}
          >
            <Text style={[styles.sortTxt, sel && styles.sortTxtSel]}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
});

// Category chips
type CategoryChipsProps = {
  selectedCategories: ReadonlySet<DirectoryCategory>;
  onToggle: (key: DirectoryCategory) => void;
  onClearAll: () => void;
};

const CategoryChipsRow = React.memo(function CategoryChipsRow({
  selectedCategories,
  onToggle,
  onClearAll,
}: CategoryChipsProps) {
  const scrolling = useRef(false);
  const scrollEndTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const markScrollEnd = useCallback(() => {
    clearTimeout(scrollEndTimer.current);
    // Keep guard active for 180 ms after scroll ends — covers the tap fired on finger lift
    scrollEndTimer.current = setTimeout(() => { scrolling.current = false; }, 180);
  }, []);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipRow}
      style={styles.chipScroll}
      keyboardShouldPersistTaps="always"
      onScrollBeginDrag={() => { scrolling.current = true; }}
      onScrollEndDrag={markScrollEnd}
      onMomentumScrollEnd={() => { scrolling.current = false; }}
    >
      {/* "All" — active only when nothing selected */}
      <TouchableOpacity
        style={[styles.chip, selectedCategories.size === 0 && styles.chipSel]}
        onPress={() => { if (!scrolling.current) onClearAll(); }}
        delayPressIn={50}
        activeOpacity={0.85}
      >
        <Text style={[styles.chipTxt, selectedCategories.size === 0 && styles.chipTxtSel]}>All</Text>
      </TouchableOpacity>

      {DIRECTORY_FILTER_KEYS.map((key) => {
        const sel = selectedCategories.has(key);
        return (
          <TouchableOpacity
            key={key}
            style={[styles.chip, sel && styles.chipSel]}
            onPress={() => { if (!scrolling.current) onToggle(key); }}
            delayPressIn={50}
            activeOpacity={0.85}
          >
            <Text style={[styles.chipTxt, sel && styles.chipTxtSel]}>
              {DIRECTORY_CATEGORY_LABEL[key]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
});

// ─── Sections Header (working on + recommended + count) ──────────────────────
// Sort chips and category chips live in the FIXED top bar (never in FlatList)
// so they never remount when sort/category state changes.

type SectionsHeaderProps = {
  workingOn: DirectoryLawyer[];
  recommended: DirectoryLawyer[];
  horizontalCardWidth: number;
  onLawyerPress: (profileId: string) => void;
  filteredCount: number;
};

const SectionsHeader = React.memo(function SectionsHeader({
  workingOn,
  recommended,
  horizontalCardWidth,
  onLawyerPress,
  filteredCount,
}: SectionsHeaderProps) {
  return (
    <>
      {/* ── Working on your cases ── */}
      {workingOn.length > 0 && (
        <View style={styles.sectionBlock}>
          <View style={styles.sectionLabelRow}>
            <View style={styles.sectionDot} />
            <Text style={styles.sectionTitle}>Working on your cases</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hScrollContent}
          >
            {workingOn.map((item) => (
              <View key={item.id} style={[styles.hCardWrap, { width: horizontalCardWidth }]}>
                <LawyerDirectoryCard rail item={item} onPress={() => onLawyerPress(item.profileId)} />
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* ── Recommended ── */}
      {recommended.length > 0 && (
        <View style={styles.sectionBlock}>
          <View style={styles.sectionLabelRow}>
            <MaterialIcons name="auto-awesome" size={14} color={Colors.gold} />
            <Text style={styles.sectionTitle}>Recommended for you</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hScrollContent}
          >
            {recommended.map((item) => (
              <View key={item.id} style={[styles.hCardWrap, { width: horizontalCardWidth }]}>
                <LawyerDirectoryCard rail item={item} onPress={() => onLawyerPress(item.profileId)} />
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* ── All Lawyers header ── */}
      <View style={styles.allLawyersHeader}>
        <Text style={styles.sectionTitle}>All Lawyers</Text>
        <View style={styles.countPill}>
          <Text style={styles.count}>
            {filteredCount} {filteredCount === 1 ? 'result' : 'results'}
          </Text>
        </View>
      </View>
    </>
  );
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function LawyersTabScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { width: windowWidth } = useWindowDimensions();
  const horizontalCardWidth = Math.min(windowWidth * 0.88, 360);
  const { directoryLawyers, hydrateLawyerData, hydrated, isHydrating } = useLawyerDataStore();
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!hydrated) {
        hydrateLawyerData();
      } else if (isFirstLoad) {
        setIsFirstLoad(false);
      }
    }, [hydrateLawyerData, hydrated, isFirstLoad]),
  );

  // ── Read deep-link param (from Home navigation) ────────────────────────────
  const params = useLocalSearchParams<{ category?: string | string[] }>();
  const rawCategory = Array.isArray(params.category) ? params.category[0] : params.category;

  // ── Zustand store — persists across web navigation remounts ────────────────
  // All filter mutations go through the store; NO router.setParams needed.
  const {
    categories: storeCategories,
    sort,
    appliedSheet: storeAppliedSheet,
    search,
    setCategories,
    setSort,
    setAppliedSheet,
    setSearch,
    clearAll: clearAllStore,
  } = useLawyerFiltersStore();

  // Convert stored array to a Set for O(1) lookups in renders
  const selectedCategories = useMemo(
    () => new Set(storeCategories) as ReadonlySet<DirectoryCategory>,
    [storeCategories],
  );

  // Seed store from deep-link URL param on first mount (Home → Lawyers)
  const seededFromURL = useRef(false);
  useEffect(() => {
    if (!seededFromURL.current) {
      seededFromURL.current = true;
      if (rawCategory) {
        const parsed = parseDirectoryCategoryParam(rawCategory);
        if (parsed && storeCategories.length === 0) {
          setCategories([parsed]);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // UI-only state (no need to persist these)
  const [searchFocused, setSearchFocused] = useState(false);
  const [pendingSheet, setPendingSheet] = useState<SheetFilters>(storeAppliedSheet);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Sheet open/close — pending sheet is a local copy until "Apply" is tapped
  const openSheet = useCallback(() => {
    Keyboard.dismiss();
    setSearchFocused(false);
    setPendingSheet(storeAppliedSheet);
    setSheetOpen(true);
  }, [storeAppliedSheet]);

  const closeSheet = useCallback(() => setSheetOpen(false), []);

  const applySheet = useCallback(() => {
    setAppliedSheet(pendingSheet); // persist to store
    setSheetOpen(false);
  }, [pendingSheet, setAppliedSheet]);

  const directoryFilters = useMemo<DirectoryFilters>(
    () => ({
      categories: storeCategories,
      search,
      location: storeAppliedSheet.location,
      onlineOnly: storeAppliedSheet.onlineOnly,
      rating: storeAppliedSheet.rating,
      price: storeAppliedSheet.price,
      courtType: storeAppliedSheet.courtType,
      sort: 'rating',
    }),
    [storeCategories, search, storeAppliedSheet],
  );

  const filtered = useMemo(() => {
    const source = directoryLawyers ?? DIRECTORY_LAWYERS;
    const all = sortDirectoryLawyers(filterDirectoryLawyers(source, directoryFilters), sort);
    // Deduplicate alt-city rows — show each unique lawyer only once
    const seen = new Set<string>();
    return all.filter((l) => {
      if (seen.has(l.profileId)) return false;
      seen.add(l.profileId);
      return true;
    });
  }, [directoryFilters, sort, directoryLawyers]);

  const workingSet = useMemo(() => new Set(WORKING_ON_PROFILE_IDS), []);

  // Deduplicate by profileId so the same lawyer never appears twice in a rail
  const dedupeByProfileId = useCallback((arr: DirectoryLawyer[]) => {
    const seen = new Set<string>();
    return arr.filter((l) => {
      if (seen.has(l.profileId)) return false;
      seen.add(l.profileId);
      return true;
    });
  }, []);

  const workingOn = useMemo(
    () => dedupeByProfileId(filtered.filter((l) => workingSet.has(l.profileId))),
    [filtered, workingSet, dedupeByProfileId],
  );

  const recommended = useMemo(() => {
    const rest = dedupeByProfileId(filtered.filter((l) => !workingSet.has(l.profileId)));
    // Already filtered by selected categories; just take top 5 by rating
    return [...rest].sort((a, b) => b.rating - a.rating).slice(0, 5);
  }, [filtered, workingSet, dedupeByProfileId]);

  // Active filter chips — sheet filters only (categories shown as chip pills above)
  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (storeAppliedSheet.rating !== 'any') n++;
    if (storeAppliedSheet.price !== 'any') n++;
    if (storeAppliedSheet.location !== 'all') n++;
    if (storeAppliedSheet.courtType !== 'all') n++;
    if (storeAppliedSheet.onlineOnly) n++;
    return n;
  }, [storeAppliedSheet]);

  const activeChips = useMemo<ActiveChip[]>(() => {
    const chips: ActiveChip[] = [];
    if (storeAppliedSheet.rating !== 'any') {
      chips.push({ id: 'rating', label: `${storeAppliedSheet.rating}+ ★`, onRemove: () => setAppliedSheet({ ...storeAppliedSheet, rating: 'any' }) });
    }
    if (storeAppliedSheet.price !== 'any') {
      chips.push({ id: 'price', label: PRICE_LABEL[storeAppliedSheet.price], onRemove: () => setAppliedSheet({ ...storeAppliedSheet, price: 'any' }) });
    }
    if (storeAppliedSheet.location !== 'all') {
      chips.push({ id: 'location', label: storeAppliedSheet.location, onRemove: () => setAppliedSheet({ ...storeAppliedSheet, location: 'all' }) });
    }
    if (storeAppliedSheet.courtType !== 'all') {
      chips.push({ id: 'court', label: COURT_TYPE_LABEL[storeAppliedSheet.courtType as CourtType], onRemove: () => setAppliedSheet({ ...storeAppliedSheet, courtType: 'all' }) });
    }
    if (storeAppliedSheet.onlineOnly) {
      chips.push({ id: 'online', label: '🟢 Online', onRemove: () => setAppliedSheet({ ...storeAppliedSheet, onlineOnly: false }) });
    }
    return chips;
  }, [storeAppliedSheet, setAppliedSheet]);

  // Toggle a single category chip on/off (multi-select)
  const toggleCategory = useCallback((key: DirectoryCategory) => {
    const next = new Set(storeCategories);
    if (next.has(key)) { next.delete(key); } else { next.add(key); }
    setCategories(Array.from(next));
    setSearch('');
    setSearchFocused(false);
  }, [storeCategories, setCategories, setSearch]);

  // Clear all category selections (tap "All")
  const clearCategories = useCallback(() => {
    setCategories([]);
    setSearch('');
    setSearchFocused(false);
  }, [setCategories, setSearch]);

  // Single-select helper used by autocomplete suggestion
  const clearAllFilters = useCallback(() => {
    clearAllStore();
    setSearchFocused(false);
  }, [clearAllStore]);

  // Navigation
  const goBackOrHome = useCallback(() => {
    if (navigation.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  }, [navigation, router]);

  const onRowPress = useCallback(
    (profileId: string) => {
      // Use direct path string — more reliable than template params in Expo Router
      router.push(`/lawyer/${profileId}` as any);
    },
    [router],
  );

  // FlatList helpers
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<DirectoryLawyer>) => {
      const profileId = item.profileId; // capture stable reference before closure
      return <LawyerDirectoryCard item={item} onPress={() => onRowPress(profileId)} />;
    },
    [onRowPress],
  );

  const keyExtractor = useCallback((item: DirectoryLawyer) => item.id, []);

  // ── Smart search / autocomplete ───────────────────────────────────────────
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [dropdownTopOffset, setDropdownTopOffset] = useState(110);
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    clearTimeout(suggestTimer.current);
    suggestTimer.current = setTimeout(() => {
      // Cap at 5 items for a compact, non-intrusive dropdown
      setSuggestions(generateSuggestions(search, directoryLawyers ?? DIRECTORY_LAWYERS, 5));
    }, 300);
    return () => clearTimeout(suggestTimer.current);
  }, [search, directoryLawyers]);

  const showDropdown = searchFocused && suggestions.length > 0;

  // Dismiss keyboard + close dropdown + optionally clear input
  const dismissSearch = useCallback((clearInput = false) => {
    Keyboard.dismiss();
    setSearchFocused(false);
    if (clearInput) setSearch('');
  }, [setSearch]);

  const onSuggestionSelect = useCallback((s: SearchSuggestion) => {
    // Always dismiss keyboard and clear input — Google-like feel
    Keyboard.dismiss();
    setSearchFocused(false);
    setSearch('');

    if (s.type === 'lawyer') {
      setSearch(s.display); // Show lawyer name in search field
    } else if (s.category) {
      const next = new Set(storeCategories);
      next.add(s.category);
      setCategories(Array.from(next));
    } else {
      setSearch(s.query);
    }
  }, [storeCategories, setCategories, setSearch]);

  // SectionsHeader only shows "working on", "recommended", and the "All Lawyers" count.
  // Sort + category chips are in the fixedTop area so they never remount.
  const listHeader = useMemo(
    () => (
      <SectionsHeader
        workingOn={workingOn}
        recommended={recommended}
        horizontalCardWidth={horizontalCardWidth}
        onLawyerPress={onRowPress}
        filteredCount={filtered.length}
      />
    ),
    [workingOn, recommended, horizontalCardWidth, onRowPress, filtered.length],
  );

  const emptyMessage = useMemo(() => {
    if (search.trim()) return `No lawyers found for "${search}"`;
    if (selectedCategories.size > 0) {
      const labels = Array.from(selectedCategories).map((c) => DIRECTORY_CATEGORY_LABEL[c]).join(' + ');
      return `No ${labels} lawyers match your filters`;
    }
    return 'No lawyers match your filters';
  }, [search, selectedCategories]);

  const listEmpty = useMemo(() => (
    <View style={styles.empty}>
      <MaterialIcons name="people-outline" size={48} color={Colors.textTertiary} />
      <Text style={styles.emptyTitle}>{emptyMessage}</Text>
      <Text style={styles.emptySub}>Try clearing filters or broadening your search.</Text>
      <TouchableOpacity style={styles.emptyBtn} onPress={clearAllFilters} activeOpacity={0.82}>
        <Text style={styles.emptyBtnTxt}>Show All Lawyers</Text>
      </TouchableOpacity>
    </View>
  ), [emptyMessage, clearAllFilters]);

  if (isFirstLoad && isHydrating) {
    return <LoadingScreen message="Loading lawyers..." />;
  }

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.safeTop} />

      {/* ── Fixed top bar: title + smart search bar + active chips ── */}
      <View
        style={styles.fixedTop}
        onLayout={(e) => setDropdownTopOffset(e.nativeEvent.layout.height)}
      >
        {/* Header row */}
        <View style={styles.header}>
          {navigation.canGoBack() ? (
            <TouchableOpacity onPress={goBackOrHome} style={styles.backBtn} hitSlop={12}>
              <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.backBtn} />
          )}
          <Text style={styles.headerTitle}>Lawyers</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Smart search + filter button */}
        <View style={styles.searchRow}>
          <View style={[styles.searchWrap, searchFocused && styles.searchWrapFocused]}>
            <MaterialIcons name="search" size={18} color={searchFocused ? Colors.primary : Colors.textTertiary} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => {
                // Delay so tap on a suggestion registers before blur hides the dropdown
                setTimeout(() => setSearchFocused(false), 150);
              }}
              placeholder="Search lawyer or describe your issue"
              placeholderTextColor={Colors.textTertiary}
              style={styles.searchInput}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
              onSubmitEditing={() => dismissSearch(false)}
              blurOnSubmit
              clearButtonMode={Platform.OS === 'ios' ? 'while-editing' : 'never'}
            />
            {search.length > 0 && (
              <TouchableOpacity
                onPress={() => dismissSearch(true)}
                hitSlop={10}
              >
                <MaterialIcons name="close" size={16} color={Colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
            onPress={openSheet}
            activeOpacity={0.82}
          >
            <MaterialIcons name="tune" size={20} color={activeFilterCount > 0 ? Colors.primary : Colors.textSecondary} />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeTxt}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Active sheet-filter chips + selected-category chips */}
        <ActiveFilterChips
          chips={[
            // Each selected category as its own removable chip
            ...Array.from(selectedCategories).map((cat) => ({
              id: `cat-${cat}`,
              label: DIRECTORY_CATEGORY_LABEL[cat],
              onRemove: () => toggleCategory(cat),
            })),
            ...activeChips,
          ]}
          onClearAll={clearAllFilters}
        />

        {/* ── Sort chips (scroll-safe) ── */}
        <SortChipsRow sort={sort} onSortChange={setSort} />

        {/* ── Category chips: multi-select, scroll-safe ── */}
        <CategoryChipsRow
          selectedCategories={selectedCategories}
          onToggle={toggleCategory}
          onClearAll={clearCategories}
        />
      </View>

      {/* ── Scrollable content ── */}
      <FlatList
        data={filtered}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        initialNumToRender={10}
        maxToRenderPerBatch={8}
        windowSize={7}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onScrollBeginDrag={() => setSearchFocused(false)}
      />

      {/* ── Autocomplete dropdown (absolute, over FlatList) ── */}
      <SuggestionsDropdown
        suggestions={suggestions}
        onSelect={onSuggestionSelect}
        onClose={() => setSearchFocused(false)}
        visible={showDropdown}
        topOffset={dropdownTopOffset}
      />

      {/* ── Filter sheet ── */}
      <FilterSheet
        visible={sheetOpen}
        pending={pendingSheet}
        onChange={setPendingSheet}
        onApply={applySheet}
        onClear={() => setPendingSheet(DEFAULT_SHEET_STORE)}
        onClose={closeSheet}
      />
    </View>
  );
}

// ─── Main Styles ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgPrimary, overflow: 'hidden' },
  safeTop: { backgroundColor: Colors.bgPrimary },
  listContent: { paddingHorizontal: 16, paddingBottom: 110, paddingTop: 8, flexGrow: 1 },

  // Fixed top bar
  fixedTop: {
    backgroundColor: Colors.bgPrimary,
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
    zIndex: 10,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  backBtn: { padding: 4, width: 36 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800', color: Colors.textPrimary },
  headerRight: { width: 36 },

  // Search row
  searchRow: { flexDirection: 'row', gap: 8, marginBottom: 10, alignItems: 'center' },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.bgSecondary,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    height: 44,
  },
  searchWrapFocused: {
    borderColor: Colors.primary,
    backgroundColor: '#080D1C',
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.textPrimary, paddingVertical: 0 },

  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.bgSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySubtle,
  },
  filterBadge: {
    position: 'absolute',
    top: 5, right: 5,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.bgPrimary,
  },
  filterBadgeTxt: { fontSize: 9, fontWeight: '800', color: '#fff' },

  // Active filter chips
  activeChipScroll: { marginHorizontal: -16, marginBottom: 8 },
  activeChipRow: { paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 7, paddingBottom: 2 },
  activeChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: Colors.primarySubtle,
    borderWidth: 1, borderColor: 'rgba(59,91,219,0.35)',
  },
  activeChipTxt: { fontSize: 11, fontWeight: '600', color: Colors.primary },
  clearAllChip: {
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: Colors.dangerSubtle,
    borderWidth: 1, borderColor: 'rgba(248,81,73,0.35)',
  },
  clearAllTxt: { fontSize: 11, fontWeight: '600', color: Colors.danger },

  // Sort chips
  sortScroll: { marginHorizontal: -16, marginBottom: 10 },
  sortRow: { paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 7, paddingBottom: 2 },
  sortChip: {
    paddingHorizontal: 13, paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.bgSecondary,
    borderWidth: 1, borderColor: Colors.border,
  },
  sortChipSel: { backgroundColor: Colors.primarySubtle, borderColor: Colors.primary },
  sortTxt: { fontSize: 12, fontWeight: '500', color: Colors.textSecondary },
  sortTxtSel: { color: Colors.primary, fontWeight: '700' },

  // Category chips
  chipScroll: { marginHorizontal: -16, marginBottom: 12 },
  chipRow: { paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', paddingBottom: 4 },
  chip: {
    marginRight: 7,
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.bgSecondary,
    borderWidth: 1, borderColor: Colors.border,
  },
  chipSel: { backgroundColor: Colors.primarySubtle, borderColor: Colors.primary },
  chipTxt: { fontSize: 12, fontWeight: '500', color: Colors.textSecondary },
  chipTxtSel: { color: Colors.primary, fontWeight: '700' },

  // Sections
  sectionBlock: { marginBottom: 20 },
  sectionLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  sectionDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  hScrollContent: { gap: 12, paddingBottom: 2 },
  hCardWrap: {},
  allLawyersHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 12,
  },
  countPill: {
    backgroundColor: Colors.bgElevated, borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  count: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },

  // Empty state
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 24, gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
  emptySub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  emptyBtn: {
    marginTop: 4, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14,
    backgroundColor: Colors.primarySubtle, borderWidth: 1, borderColor: Colors.primary,
  },
  emptyBtnTxt: { fontSize: 14, fontWeight: '700', color: Colors.primary },
});

// ─── Sheet Styles ─────────────────────────────────────────────────────────────

const sheetStyles = StyleSheet.create({
  backdropDim: { backgroundColor: 'rgba(0,0,0,0.6)' },

  sheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.bgSecondary,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.4, shadowRadius: 20,
  },

  handleZone: {
    alignItems: 'center', paddingTop: 10, paddingBottom: 6, gap: 4,
  },
  handlePill: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.border,
  },
  dragHint: {
    fontSize: 10, color: Colors.textTertiary,
    letterSpacing: 0.5,
  },

  sheetHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle,
  },
  sheetTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  clearAll: { fontSize: 13, fontWeight: '600', color: Colors.primary },

  sectionLabel: {
    fontSize: 10, fontWeight: '700',
    color: Colors.textTertiary, letterSpacing: 1,
    textTransform: 'uppercase', marginBottom: 10,
  },
  quickSection: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
  sectionDivider: {
    borderTopWidth: 1, borderTopColor: Colors.borderSubtle,
    paddingTop: 12, paddingHorizontal: 16, marginBottom: 2,
  },

  quickRow: { flexDirection: 'row', gap: 8, marginBottom: 2 },
  quickChip: {
    flex: 1, paddingVertical: 10, borderRadius: 12,
    backgroundColor: Colors.bgElevated, borderWidth: 1,
    borderColor: Colors.border, alignItems: 'center',
  },
  quickChipSel: { backgroundColor: Colors.primarySubtle, borderColor: Colors.primary },
  quickChipOnline: { backgroundColor: Colors.successSubtle, borderColor: Colors.success },
  quickTxt: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  quickTxtSel: { color: Colors.primary },
  quickTxtOnline: { color: Colors.success },

  scrollView: { flex: 1 },
  sheetScroll: { paddingHorizontal: 16, paddingBottom: 4 },

  accSection: { borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle },
  accHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 12,
  },
  accTitle: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  accBody: { overflow: 'hidden' },
  accContent: { paddingBottom: 10 },

  optRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  optChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10,
    backgroundColor: Colors.bgElevated, borderWidth: 1,
    borderColor: Colors.border,
  },
  optChipSel: { backgroundColor: Colors.primarySubtle, borderColor: Colors.primary },
  optTxt: { fontSize: 12, fontWeight: '500', color: Colors.textSecondary },
  optTxtSel: { color: Colors.primary, fontWeight: '700' },

  onlineSection: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 12,
  },

  applyWrap: {
    paddingHorizontal: 16, paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 30 : 18,
    borderTopWidth: 1, borderTopColor: Colors.borderSubtle,
    backgroundColor: Colors.bgSecondary,
  },
  applyBtn: {
    height: 50, borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
  },
  applyTxt: { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
});

// ─── Dropdown Styles ──────────────────────────────────────────────────────────

const dd = StyleSheet.create({
  hidden: { width: 0, height: 0 },
  container: {
    position: 'absolute',
    left: 12, right: 12,
    marginTop: 8,
    backgroundColor: Colors.bgSecondary,
    borderRadius: 16,
    borderWidth: 1, borderColor: Colors.border,
    maxHeight: 260,
    zIndex: 200, elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5, shadowRadius: 20,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10, gap: 10,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle },
  iconWrap: {
    width: 28, height: 28, borderRadius: 7,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  textWrap: { flex: 1, minWidth: 0 },
  displayTxt: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  subTxt: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },
  catPill: {
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, flexShrink: 0,
  },
  catTxt: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
});
