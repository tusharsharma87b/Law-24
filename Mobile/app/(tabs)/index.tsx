import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Animated, Alert, useWindowDimensions, Dimensions, Platform, Keyboard,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors } from '../../constants/colors';
import { LawyerCard, mapLawyerToCardModel } from '../components/lawyer/LawyerCard';
import { LEGAL_DEPARTMENTS } from '../../constants/legalDepartments';
import { MOCK_LAWYERS } from '../../constants/mockData';
import { DIRECTORY_LAWYERS } from '../../constants/lawyersDirectory';
import { useAuthStore } from '../../store/useAuthStore';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { resolveSearchIntent, SEARCH_PLACEHOLDERS } from '../../constants/searchIntentMap';
import { NotificationSheet } from '../../components/notifications/NotificationSheet';
import { useUnreadCount } from '../../store/useNotificationStore';
import { useWalletStore } from '../../store/useWalletStore';
import {
  generateSuggestions,
  type SearchSuggestion,
} from '../../constants/lawyerSearchSuggestions';
import { useLawyerDataStore } from '../../store/useLawyerDataStore';
import { LoadingScreen } from '../../components/ui/LoadingScreen';

// ─── Category accent colours (for dropdown) ──────────────────────────────────
const CAT_ACCENT: Partial<Record<string, string>> = {
  criminal: '#F85149', family: '#FF9F43', property: '#3FB950',
  employment: '#58A6FF', civil: '#F5A623', corporate: '#A78BFA',
  cyber: '#60A5FA', tax: '#34D399',
};

const SCREEN_WIDTH = Dimensions.get('window').width;

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const { width: screenWidth, height: windowHeight } = useWindowDimensions();
  const viewportWidth = Platform.OS === 'web' ? Math.min(SCREEN_WIDTH, 430) : screenWidth;
  const categoryCardWidth = viewportWidth / 4.8;
  const categoryCardHeight = 88;
  const categoryGap = 10;
  const expertCardWidth = 280;
  const topCardWidth = 280;
  const listGap = 14;

  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const unreadCount = useUnreadCount();
  const { balance } = useWalletStore();
  const [notifSheetOpen, setNotifSheetOpen] = useState(false);
  const { featuredLawyers, directoryLawyers, hydrateLawyerData, hydrated, isHydrating, preloadLawyerData } = useLawyerDataStore();
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

  // ── Android hardware back button — exit confirmation ──────────────────────
  // Only active when the Home screen is in focus.
  // Prevents accidental app exit; does NOT touch auth state.
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') return;

      const onBack = () => {
        // If notification sheet is open, close it first (do not exit app)
        if (notifSheetOpen) {
          setNotifSheetOpen(false);
          return true;
        }
        Alert.alert(
          'Exit App?',
          'Do you want to close Law24?',
          [
            { text: 'Stay', style: 'cancel' },
            { text: 'Exit', style: 'destructive', onPress: () => BackHandler.exitApp() },
          ],
          { cancelable: true },
        );
        return true; // consume the event — prevent default back behaviour
      };

      const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
      return () => sub.remove();
    }, [notifSheetOpen]),
  );

  const openLawyers = (categoryParam?: string) => {
    if (categoryParam) {
      router.push({ pathname: '/(tabs)/lawyers', params: { category: categoryParam } });
    } else {
      router.push('/(tabs)/lawyers');
    }
  };

  // ── Smart Search ─────────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [fixedTopH, setFixedTopH] = useState(110);
  const sugTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const dropFade = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  // Cycling placeholder
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const placeholderFade = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const id = setInterval(() => {
      Animated.sequence([
        Animated.timing(placeholderFade, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(placeholderFade, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
      setPlaceholderIdx((i) => (i + 1) % SEARCH_PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(id);
  }, [placeholderFade]);

  // Debounced suggestions — 300ms
  useEffect(() => {
    clearTimeout(sugTimer.current);
    sugTimer.current = setTimeout(() => {
      const raw = generateSuggestions(search, directoryLawyers ?? DIRECTORY_LAWYERS);
      // Hard cap at 5 items for a compact dropdown
      setSuggestions(raw.slice(0, 5));
    }, 300);
    return () => clearTimeout(sugTimer.current);
  }, [search]);

  const showDropdown = searchFocused && suggestions.length > 0;

  // Fade dropdown in / out
  useEffect(() => {
    Animated.timing(dropFade, {
      toValue: showDropdown ? 1 : 0,
      duration: showDropdown ? 180 : 120,
      useNativeDriver: true,
    }).start();
  }, [showDropdown, dropFade]);

  /** Dismiss keyboard + close dropdown + optionally clear input */
  const dismissSearch = useCallback((clearInput = false) => {
    Keyboard.dismiss();
    setSearchFocused(false);
    if (clearInput) setSearch('');
  }, []);

  // ── Route-choice sheet ──────────────────────────────────────────────────
  const [selectedSug, setSelectedSug] = useState<SearchSuggestion | null>(null);
  const [routeSheetMounted, setRouteSheetMounted] = useState(false);
  const routeSheetAnim = useRef(new Animated.Value(0)).current;

  const openRouteSheet = useCallback((sug: SearchSuggestion) => {
    // Immediately dismiss keyboard + clear input — Google-like UX
    Keyboard.dismiss();
    setSearchFocused(false);
    setSearch('');
    setSelectedSug(sug);
    setRouteSheetMounted(true);
    routeSheetAnim.setValue(0);
    Animated.spring(routeSheetAnim, { toValue: 1, useNativeDriver: true, speed: 22, bounciness: 3 }).start();
  }, [routeSheetAnim]);

  const closeRouteSheet = useCallback(() => {
    Animated.timing(routeSheetAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(({ finished }) => {
      if (finished) { setRouteSheetMounted(false); setSelectedSug(null); }
    });
  }, [routeSheetAnim]);

  const goToLawyers = useCallback(() => {
    closeRouteSheet();
    const cat = selectedSug?.category ?? resolveSearchIntent(search);
    if (cat) router.push({ pathname: '/(tabs)/lawyers', params: { category: cat } });
    else router.push('/(tabs)/lawyers');
  }, [closeRouteSheet, router, selectedSug, search]);

  const goToNyaya = useCallback(() => {
    closeRouteSheet();
    router.push({ pathname: '/nyaya', params: { query: selectedSug?.query ?? search } });
  }, [closeRouteSheet, router, selectedSug, search]);

  // Submit from keyboard — routes directly if intent is clear, otherwise shows sheet
  const handleSearchSubmit = useCallback(() => {
    const q = search.trim();
    if (!q) return;
    const category = resolveSearchIntent(q);
    // If we have a direct category match, skip the sheet and go straight to lawyers
    if (category) {
      dismissSearch(true);
      router.push({ pathname: '/(tabs)/lawyers', params: { category } });
      return;
    }
    const synth: SearchSuggestion = {
      id: 'manual',
      display: q,
      query: q,
      type: 'trending',
      category: undefined,
      icon: 'search',
    };
    openRouteSheet(synth);
  }, [search, openRouteSheet, dismissSearch, router]);
  // ─────────────────────────────────────────────────────────────────────────
  const sourceLawyers = featuredLawyers ?? MOCK_LAWYERS;
  const liveExperts = sourceLawyers.filter((l) => l.isOnline).slice(0, 3);
  const topRated = [...sourceLawyers].filter((l) => l.rating.average > 4.7).sort((a, b) => b.rating.average - a.rating.average).slice(0, 3);
  const fastResponse = [...sourceLawyers].filter((l) => l.responseTimeMinutes <= 2).slice(0, 3);
  const budgetLawyers = [...sourceLawyers].filter((l) => l.fees.chatPerMinuteInr < 20).slice(0, 3);
  const [activeCategory, setActiveCategory] = useState(0);
  const [activeExpert, setActiveExpert] = useState(0);
  const [activeTopRated, setActiveTopRated] = useState(0);
  const [activeFast, setActiveFast] = useState(0);
  const [activeBudget, setActiveBudget] = useState(0);

  const categoryScrollX = useRef(new Animated.Value(0)).current;
  const expertsScrollX = useRef(new Animated.Value(0)).current;
  const topRatedScrollX = useRef(new Animated.Value(0)).current;
  const fastScrollX = useRef(new Animated.Value(0)).current;
  const budgetScrollX = useRef(new Animated.Value(0)).current;

  if (isFirstLoad && isHydrating) {
    return <LoadingScreen message="Loading experts..." />;
  }

  return (
    <View style={s.root}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.bgPrimary }} />

      {/* ── Fixed top: header + smart search (never scrolls) ── */}
      <View
        style={s.fixedTop}
        onLayout={(e) => setFixedTopH(e.nativeEvent.layout.height)}
      >
        <View style={s.header}>
          <View>
            <Text style={s.logo}>Law<Text style={s.logoAccent}>24</Text></Text>
            <Text style={s.headerSub}>Your Legal Partner</Text>
          </View>
          <View style={s.headerIcons}>
            {/* Wallet */}
            <TouchableOpacity
              style={s.iconBtn}
              onPress={() => router.push('/(tabs)/profile')}
              activeOpacity={0.8}
              hitSlop={8}
            >
              <MaterialIcons name="account-balance-wallet" size={21} color={Colors.textSecondary} />
              <Text style={s.walletAmt}>₹{balance >= 1000 ? `${(balance / 1000).toFixed(1)}k` : balance}</Text>
            </TouchableOpacity>
            {/* Bell */}
            <TouchableOpacity
              style={s.iconBtn}
              onPress={() => setNotifSheetOpen((v) => !v)}
              activeOpacity={0.8}
              hitSlop={8}
            >
              <MaterialIcons
                name={unreadCount > 0 ? 'notifications' : 'notifications-none'}
                size={22}
                color={Colors.textPrimary}
              />
              {unreadCount > 0 && (
                <View style={s.bellBadge}>
                  <Text style={s.bellBadgeTxt}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Search bar */}
        <View style={[s.searchRow, searchFocused && s.searchRowFocused]}>
          <MaterialIcons name="search" size={18} color={searchFocused ? Colors.primary : Colors.textTertiary} />
          <View style={s.searchInputWrap}>
            {search.length === 0 && !searchFocused && (
              <Animated.Text style={[s.searchPlaceholder, { opacity: placeholderFade }]} numberOfLines={1}>
                {SEARCH_PLACEHOLDERS[placeholderIdx]}
              </Animated.Text>
            )}
            {search.length === 0 && searchFocused && (
              <Text style={s.searchPlaceholder}>Describe your issue (Hindi / English)</Text>
            )}
            <TextInput
              ref={inputRef}
              style={s.searchInput}
              value={search}
              onChangeText={setSearch}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => {
                // Slight delay so tap on suggestion registers before blur hides it
                setTimeout(() => setSearchFocused(false), 150);
              }}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
              blurOnSubmit
            />
          </View>
          {search.length > 0 ? (
            <TouchableOpacity onPress={() => { setSearch(''); setSearchFocused(false); }} hitSlop={10}>
              <MaterialIcons name="close" size={16} color="#6B7280" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={s.micBtn}
              hitSlop={8}
              activeOpacity={0.7}
            >
              <MaterialIcons name="mic" size={16} color={Colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Quick chips */}
        {!searchFocused && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={s.chips}
            contentContainerStyle={s.chipsContent}
          >
            {[
              { label: 'Salary not paid', icon: 'money-off' },
              { label: 'FIR issue', icon: 'gavel' },
              { label: 'Divorce help', icon: 'family-restroom' },
              { label: 'Property dispute', icon: 'home-work' },
              { label: 'Consumer fraud', icon: 'report' },
            ].map((chip) => (
              <TouchableOpacity
                key={chip.label}
                style={s.chip}
                activeOpacity={0.75}
                onPress={() => {
                  const category = resolveSearchIntent(chip.label);
                  if (category) {
                    dismissSearch(true);
                    router.push({ pathname: '/(tabs)/lawyers', params: { category } });
                  } else {
                    setSearch(chip.label);
                  }
                }}
              >
                <MaterialIcons name={chip.icon as any} size={12} color={Colors.primary} />
                <Text style={s.chipTxt}>{chip.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* ── Scrollable content ── */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={() => dismissSearch(false)}
      >
        <Text style={s.greeting}>{getGreeting()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋</Text>

        {/* NYAYAAI CARD */}
        <View style={s.aiCard}>
          <View style={s.aiTop}>
            <View style={s.aiIconBox}>
              <MaterialIcons name="auto-awesome" size={22} color={Colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.aiTitle}>NyayaAI</Text>
              <Text style={s.aiSub}>Get instant legal guidance in seconds.</Text>
            </View>
          </View>
          {['Understand your situation clearly', 'Know your legal rights', 'Actionable next steps'].map((b, i) => (
            <View key={i} style={s.bullet}>
              <Text style={s.bulletCheck}>✓</Text>
              <Text style={s.bulletText}>{b}</Text>
            </View>
          ))}
          <TouchableOpacity style={s.aiCta} onPress={() => router.push('/nyaya')} activeOpacity={0.85}>
            <Text style={s.aiCtaText}>Start Case Analysis</Text>
          </TouchableOpacity>
          <View style={s.aiTrustBlock}>
            <Text style={s.aiTrustLine}>Trained on Indian Law</Text>
            <Text style={s.aiTrustLine}>Trusted by 10,000+ users</Text>
          </View>
        </View>

        {/* ── DEPARTMENTS ── */}
        <View style={s.section}>
          <SectionHeader
            title="Legal Departments"
            onAction={() => router.push('/departments' as any)}
          />
          <Text style={s.deptSub}>Describe your problem — we'll find the right help</Text>

          {/* 2-column grid of ALL departments — clean, no counts */}
          <View style={s.deptGrid}>
            {LEGAL_DEPARTMENTS.map((dept) => (
              <TouchableOpacity
                key={dept.id}
                style={[s.deptCell, { borderColor: dept.color + '40' }]}
                onPress={() => router.push({ pathname: '/department/[id]', params: { id: dept.id } })}
                activeOpacity={0.84}
              >
                <View style={[s.deptCellIcon, { backgroundColor: dept.color + '1A' }]}>
                  <MaterialIcons name={dept.icon as any} size={22} color={dept.color} />
                </View>
                <Text style={s.deptCellName} numberOfLines={2}>{dept.name}</Text>
                <Text style={s.deptCellTagline} numberOfLines={2}>{dept.tagline}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* NOT SURE CARD */}
        <View style={s.notSure}>
          <View style={{ flex: 1 }}>
            <Text style={s.notSureTitle}>Not sure what you need?</Text>
            <Text style={s.notSureSub}>Tell us your situation in plain language…</Text>
          </View>
          <TouchableOpacity style={s.notSureBtn} onPress={() => router.push('/nyaya')} activeOpacity={0.8}>
            <Text style={s.notSureBtnTxt}>Ask AI</Text>
          </TouchableOpacity>
        </View>

        {/* LIVE EXPERTS */}
        <View style={s.section}>
          <SectionHeader title="Live Experts" onAction={() => openLawyers()} />
          <Animated.FlatList
            data={liveExperts}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={s.listFullBleed}
            contentContainerStyle={s.listContainer}
            snapToAlignment="start"
            decelerationRate="fast"
            snapToInterval={expertCardWidth + listGap}
            bounces={false}
            removeClippedSubviews={false}
            initialNumToRender={5}
            windowSize={5}
            ListFooterComponent={<View style={{ width: 16 }} />}
            getItemLayout={(_, index) => ({
              length: expertCardWidth + listGap,
              offset: (expertCardWidth + listGap) * index,
              index,
            })}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / (expertCardWidth + listGap));
              setActiveExpert(Math.max(0, idx));
            }}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: expertsScrollX } } }], { useNativeDriver: true })}
            scrollEventThrottle={16}
            renderItem={({ item, index }) => {
              const inputRange = [
                (index - 1) * (expertCardWidth + listGap),
                index * (expertCardWidth + listGap),
                (index + 1) * (expertCardWidth + listGap),
              ];
              const scale = expertsScrollX.interpolate({ inputRange, outputRange: [0.94, 1, 0.94], extrapolate: 'clamp' });
              const opacity = expertsScrollX.interpolate({ inputRange, outputRange: [0.86, 1, 0.86], extrapolate: 'clamp' });

              return (
                <Animated.View
                  style={[
                    s.expertCard,
                    { width: expertCardWidth, opacity, transform: [{ scale }] },
                  ]}
                >
                  <View style={s.cardWrapper}>
                    <LawyerCard
                      data={mapLawyerToCardModel(item)}
                      onPress={() => {
                        preloadLawyerData(item.id);
                        router.push({ pathname: '/lawyer/[id]', params: { id: item.id } });
                      }}
                      ctaLabel="Talk Now"
                    />
                  </View>
                </Animated.View>
              );
            }}
          />
        </View>

        {/* TOP RATED */}
        <View style={s.section}>
          <SectionHeader title="Top Rated" onAction={() => openLawyers()} />
          <Animated.FlatList
            data={topRated}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={s.listFullBleed}
            contentContainerStyle={s.listContainer}
            snapToAlignment="start"
            decelerationRate="fast"
            snapToInterval={topCardWidth + listGap}
            bounces={false}
            removeClippedSubviews={false}
            initialNumToRender={5}
            windowSize={5}
            ListFooterComponent={<View style={{ width: 16 }} />}
            getItemLayout={(_, index) => ({
              length: topCardWidth + listGap,
              offset: (topCardWidth + listGap) * index,
              index,
            })}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / (topCardWidth + listGap));
              setActiveTopRated(Math.max(0, idx));
            }}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: topRatedScrollX } } }], { useNativeDriver: true })}
            scrollEventThrottle={16}
            renderItem={({ item, index }) => {
              const inputRange = [
                (index - 1) * (topCardWidth + listGap),
                index * (topCardWidth + listGap),
                (index + 1) * (topCardWidth + listGap),
              ];
              const scale = topRatedScrollX.interpolate({ inputRange, outputRange: [0.94, 1, 0.94], extrapolate: 'clamp' });
              const opacity = topRatedScrollX.interpolate({ inputRange, outputRange: [0.86, 1, 0.86], extrapolate: 'clamp' });

              return (
                <Animated.View
                  style={[
                    s.topCard,
                    { width: topCardWidth, opacity, transform: [{ scale }] },
                  ]}
                >
                  <View style={s.cardWrapper}>
                    <LawyerCard
                      data={mapLawyerToCardModel(item)}
                      onPress={() => {
                        preloadLawyerData(item.id);
                        router.push({ pathname: '/lawyer/[id]', params: { id: item.id } });
                      }}
                      ctaLabel="Consult"
                    />
                  </View>
                </Animated.View>
              );
            }}
          />
        </View>

        {/* FAST RESPONSE */}
        <View style={s.section}>
          <SectionHeader title="Fast Response" onAction={() => openLawyers()} />
          <Animated.FlatList
            data={fastResponse}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={s.listFullBleed}
            contentContainerStyle={s.listContainer}
            snapToAlignment="start"
            decelerationRate="fast"
            snapToInterval={topCardWidth + listGap}
            bounces={false}
            removeClippedSubviews={false}
            initialNumToRender={5}
            windowSize={5}
            ListFooterComponent={<View style={{ width: 16 }} />}
            getItemLayout={(_, index) => ({
              length: topCardWidth + listGap,
              offset: (topCardWidth + listGap) * index,
              index,
            })}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / (topCardWidth + listGap));
              setActiveFast(Math.max(0, idx));
            }}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: fastScrollX } } }], { useNativeDriver: true })}
            scrollEventThrottle={16}
            renderItem={({ item, index }) => {
              const inputRange = [
                (index - 1) * (topCardWidth + listGap),
                index * (topCardWidth + listGap),
                (index + 1) * (topCardWidth + listGap),
              ];
              const scale = fastScrollX.interpolate({ inputRange, outputRange: [0.94, 1, 0.94], extrapolate: 'clamp' });
              const opacity = fastScrollX.interpolate({ inputRange, outputRange: [0.86, 1, 0.86], extrapolate: 'clamp' });
              return (
                <Animated.View
                  style={[
                    s.topCard,
                    { width: topCardWidth, opacity, transform: [{ scale }] },
                  ]}
                >
                  <View style={s.cardWrapper}>
                    <LawyerCard
                      data={mapLawyerToCardModel(item)}
                      onPress={() => {
                        preloadLawyerData(item.id);
                        router.push({ pathname: '/lawyer/[id]', params: { id: item.id } });
                      }}
                      ctaLabel="Talk Now"
                    />
                  </View>
                </Animated.View>
              );
            }}
          />
        </View>

        {/* BUDGET FRIENDLY */}
        <View style={s.section}>
          <SectionHeader title="Budget Friendly" onAction={() => openLawyers()} />
          <Animated.FlatList
            data={budgetLawyers}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={s.listFullBleed}
            contentContainerStyle={s.listContainer}
            snapToAlignment="start"
            decelerationRate="fast"
            snapToInterval={topCardWidth + listGap}
            bounces={false}
            removeClippedSubviews={false}
            initialNumToRender={5}
            windowSize={5}
            ListFooterComponent={<View style={{ width: 16 }} />}
            getItemLayout={(_, index) => ({
              length: topCardWidth + listGap,
              offset: (topCardWidth + listGap) * index,
              index,
            })}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / (topCardWidth + listGap));
              setActiveBudget(Math.max(0, idx));
            }}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: budgetScrollX } } }], { useNativeDriver: true })}
            scrollEventThrottle={16}
            renderItem={({ item, index }) => {
              const inputRange = [
                (index - 1) * (topCardWidth + listGap),
                index * (topCardWidth + listGap),
                (index + 1) * (topCardWidth + listGap),
              ];
              const scale = budgetScrollX.interpolate({ inputRange, outputRange: [0.94, 1, 0.94], extrapolate: 'clamp' });
              const opacity = budgetScrollX.interpolate({ inputRange, outputRange: [0.86, 1, 0.86], extrapolate: 'clamp' });
              return (
                <Animated.View
                  style={[
                    s.topCard,
                    { width: topCardWidth, opacity, transform: [{ scale }] },
                  ]}
                >
                  <View style={s.cardWrapper}>
                    <LawyerCard
                      data={mapLawyerToCardModel(item)}
                      onPress={() => {
                        preloadLawyerData(item.id);
                        router.push({ pathname: '/lawyer/[id]', params: { id: item.id } });
                      }}
                      ctaLabel="Consult"
                    />
                  </View>
                </Animated.View>
              );
            }}
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Autocomplete dropdown — animated, compact, max 5 items ── */}
      {(showDropdown || suggestions.length > 0) && (
        <Animated.View
          pointerEvents={showDropdown ? 'auto' : 'none'}
          style={[s.dropWrap, { top: fixedTopH, opacity: dropFade }]}
        >
          {suggestions.map((sug, idx) => {
            const accent = sug.category ? (CAT_ACCENT[sug.category] ?? Colors.primary) : Colors.primary;
            return (
              <TouchableOpacity
                key={sug.id}
                style={[s.dropRow, idx < suggestions.length - 1 && s.dropRowBorder]}
                onPress={() => openRouteSheet(sug)}
                activeOpacity={0.75}
              >
                {/* Icon */}
                <View style={[s.dropIcon, { backgroundColor: accent + '1A' }]}>
                  <MaterialIcons name={sug.icon as any} size={13} color={accent} />
                </View>

                {/* Text */}
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={s.dropDisplay} numberOfLines={1}>{sug.display}</Text>
                  {sug.sub ? <Text style={s.dropSub} numberOfLines={1}>{sug.sub}</Text> : null}
                </View>

                {/* Category tag */}
                {sug.category ? (
                  <View style={[s.dropCat, { backgroundColor: accent + '18' }]}>
                    <Text style={[s.dropCatTxt, { color: accent }]}>{sug.category}</Text>
                  </View>
                ) : (
                  <MaterialIcons name="north-west" size={12} color={Colors.textTertiary} />
                )}
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      )}

      {/* ── Route-choice sheet (lawyer vs AI) ── */}
      {routeSheetMounted && selectedSug && (() => {
        const accent = selectedSug.category ? (CAT_ACCENT[selectedSug.category] ?? '#4F6BFF') : '#4F6BFF';
        const sheetTranslate = routeSheetAnim.interpolate({ inputRange: [0, 1], outputRange: [300, 0] });
        const backdropOpacity = routeSheetAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.55] });
        return (
          <>
            <Animated.View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#000', opacity: backdropOpacity }]} pointerEvents="auto">
              <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={closeRouteSheet} activeOpacity={1} />
            </Animated.View>
            <Animated.View style={[s.routeSheet, { transform: [{ translateY: sheetTranslate }] }]}>
              <View style={s.routeHandle} />

              {/* Query display */}
              <View style={[s.routeQueryRow, { borderLeftColor: accent }]}>
                <View style={[s.routeQueryIcon, { backgroundColor: accent + '22' }]}>
                  <MaterialIcons name={selectedSug.icon as any} size={16} color={accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.routeQueryText} numberOfLines={1}>{selectedSug.display}</Text>
                  {selectedSug.sub ? <Text style={s.routeQuerySub}>{selectedSug.sub}</Text> : null}
                </View>
                <TouchableOpacity onPress={closeRouteSheet} hitSlop={12}>
                  <MaterialIcons name="close" size={18} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <Text style={s.routeChoiceLabel}>HOW WOULD YOU LIKE TO PROCEED?</Text>

              {/* Option 1: Talk to a Lawyer */}
              <TouchableOpacity style={s.routeCard} onPress={goToLawyers} activeOpacity={0.85}>
                <View style={[s.routeCardIcon, { backgroundColor: '#4F6BFF22' }]}>
                  <MaterialIcons name="people" size={22} color="#4F6BFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.routeCardTitle}>Talk to a Lawyer</Text>
                  <Text style={s.routeCardSub}>
                    Find {selectedSug.category ?? 'a'} lawyer · Browse experts
                  </Text>
                </View>
                <MaterialIcons name="arrow-forward-ios" size={14} color="#6B7280" />
              </TouchableOpacity>

              {/* Option 2: Ask NyayaAI */}
              <TouchableOpacity style={[s.routeCard, s.routeCardAI]} onPress={goToNyaya} activeOpacity={0.85}>
                <View style={[s.routeCardIcon, { backgroundColor: Colors.goldSubtle }]}>
                  <MaterialIcons name="auto-awesome" size={22} color={Colors.gold} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.routeCardTitle}>Ask NyayaAI</Text>
                  <Text style={s.routeCardSub}>Instant guidance · Indian Law · IPC sections</Text>
                </View>
                <MaterialIcons name="arrow-forward-ios" size={14} color="#6B7280" />
              </TouchableOpacity>
            </Animated.View>
          </>
        );
      })()}

      {/* ── Notification Sheet ── */}
      <NotificationSheet
        visible={notifSheetOpen}
        onClose={() => setNotifSheetOpen(false)}
      />

    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020617', width: '100%', maxWidth: '100%' },

  // Fixed top bar
  fixedTop: {
    backgroundColor: '#020617',
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    zIndex: 20,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, paddingBottom: 10 },
  logo:   { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, letterSpacing: 0.3 },
  logoAccent: { color: Colors.primary },
  headerSub: { fontSize: 10, color: Colors.textTertiary, marginTop: 1, letterSpacing: 0.4 },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  iconBtn: { position: 'relative', padding: 7, flexDirection: 'row', alignItems: 'center', gap: 4 },
  walletAmt: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary },
  bellBadge: {
    position: 'absolute', top: 4, right: 4,
    minWidth: 16, height: 16, borderRadius: 8,
    backgroundColor: Colors.danger,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5, borderColor: Colors.bgPrimary,
  },
  bellBadgeTxt: { fontSize: 9, fontWeight: '800', color: '#fff' },

  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgSecondary,
    borderRadius: 14, paddingHorizontal: 14, height: 44,
    gap: 10, borderWidth: 1, borderColor: Colors.border,
  },
  searchRowFocused: { borderColor: Colors.primary, backgroundColor: '#0A0F1E' },
  searchInputWrap: { flex: 1, justifyContent: 'center' },
  searchPlaceholder: {
    position: 'absolute', fontSize: 13, color: Colors.textTertiary,
    pointerEvents: 'none',
  } as any,
  searchInput: { flex: 1, color: Colors.textPrimary, fontSize: 13, paddingVertical: 0 },
  micBtn: { padding: 2 },

  chips: { marginTop: 10 },
  chipsContent: { gap: 8, flexDirection: 'row' },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.primarySubtle,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(59,91,219,0.2)',
  },
  chipTxt: { fontSize: 11, fontWeight: '600', color: Colors.primary },

  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 100 },
  greeting: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, marginBottom: 16 },

  // Autocomplete dropdown — compact, max 50% screen
  dropWrap: {
    position: 'absolute', left: 12, right: 12,
    backgroundColor: Colors.bgSecondary,
    borderRadius: 16,
    marginTop: 8,
    borderWidth: 1, borderColor: Colors.border,
    maxHeight: '50%', zIndex: 200, elevation: 30,
    shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.5, shadowRadius: 20,
    overflow: 'hidden',
  },
  dropRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10, gap: 10,
  },
  dropRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle },
  dropIcon: {
    width: 28, height: 28, borderRadius: 7,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  dropDisplay: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  dropSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },
  dropCat: {
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, flexShrink: 0,
  },
  dropCatTxt: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },

  // Route-choice sheet
  routeSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.bgSecondary,
    borderTopLeftRadius: 22, borderTopRightRadius: 22,
    paddingHorizontal: 16, paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    borderTopWidth: 1, borderTopColor: Colors.border,
    zIndex: 50, elevation: 40,
  },
  routeHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginTop: 10, marginBottom: 10 },
  routeQueryRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderLeftWidth: 3, paddingLeft: 10,
    backgroundColor: Colors.bgElevated, borderRadius: 10,
    padding: 10, marginBottom: 14,
  },
  routeQueryIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  routeQueryText: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  routeQuerySub: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },
  routeChoiceLabel: { fontSize: 10, color: Colors.textTertiary, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 },
  routeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.bgElevated, borderRadius: 14,
    padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  routeCardAI: { borderColor: Colors.goldSubtle, backgroundColor: 'rgba(245,166,35,0.05)' },
  routeCardIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  routeCardTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  routeCardSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  aiCard: {
    borderRadius: 20, padding: 18, borderWidth: 1,
    borderColor: Colors.goldSubtle, marginBottom: 20,
    backgroundColor: 'rgba(245,166,35,0.04)',
  },
  aiTop:  { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  aiIconBox:{ width: 42, height: 42, borderRadius: 12, backgroundColor: Colors.goldSubtle, alignItems: 'center', justifyContent: 'center' },
  aiTitle:{ fontSize: 17, fontWeight: '800', color: Colors.gold },
  aiSub:  { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  bullet: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 },
  bulletCheck:{ color: Colors.gold, fontSize: 13, fontWeight: '700' },
  bulletText: { color: Colors.textSecondary, fontSize: 13 },
  aiCta:  { backgroundColor: Colors.primary, borderRadius: 12, height: 46, alignItems: 'center', justifyContent: 'center', marginTop: 14 },
  aiCtaText:{ color: '#fff', fontSize: 14, fontWeight: '700', letterSpacing: 0.3 },
  aiTrustBlock: { marginTop: 10, flexDirection: 'row', justifyContent: 'center', gap: 16 },
  aiTrustLine:{ color: Colors.textTertiary, fontSize: 11, fontWeight: '500' },
  section:{ marginBottom: 20 },

  // Departments — clean 2-column grid, no counts
  deptSub: { fontSize: 12, color: Colors.textSecondary, marginBottom: 14, marginTop: -4 },
  deptGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  deptCell: {
    width: '47%', flexGrow: 1,
    backgroundColor: Colors.bgSecondary, borderRadius: 18, padding: 14,
    gap: 8, borderWidth: 1, minWidth: 140,
  },
  deptCellIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  deptCellName: { fontSize: 13, fontWeight: '800', color: Colors.textPrimary },
  deptCellTagline: { fontSize: 11, color: Colors.textSecondary, lineHeight: 16 },
  listFullBleed: { marginTop: 14, overflow: 'visible' },
  listContainer: { paddingLeft: 16, paddingRight: 12, paddingVertical: 10 },
  catListFullBleed: { marginTop: 14 },
  catListContainer: { paddingRight: 6 },
  catCardWrap: { marginRight: 10 },
  catCard:{ alignItems: 'center', justifyContent: 'center', padding: 8, backgroundColor: Colors.bgSecondary, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, gap: 6 },
  catIcon:{ width: 34, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  catLabel:{ fontSize: 11, color: Colors.textPrimary, fontWeight: '500', textAlign: 'center' },
  notSure:{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgSecondary, borderRadius: 16, padding: 14, marginBottom: 20, gap: 12, borderWidth: 1, borderColor: Colors.border },
  notSureTitle:{ color: Colors.textPrimary, fontSize: 14, fontWeight: '700' },
  notSureSub:{ color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  notSureBtn:{ backgroundColor: Colors.primarySubtle, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(59,91,219,0.25)' },
  notSureBtnTxt:{ color: Colors.primary, fontSize: 13, fontWeight: '700' },
  expertCard:{ alignItems: 'stretch', overflow: 'visible' },
  topCard:{ alignItems: 'stretch', overflow: 'visible' },
  cardWrapper: { marginRight: 14, padding: 6, paddingBottom: 8 },
});