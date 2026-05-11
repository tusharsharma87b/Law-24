import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  Animated,
  Alert,
  useWindowDimensions,
  Dimensions,
  Platform,
  Keyboard,
  BackHandler,
  FlatList,
  Image,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Spacing, ScreenSpacing, CardSpacing, SectionSpacing, Radius, Shadow } from '../../constants/spacing';
import { T } from '../../constants/typography';
import { useAuthStore } from '../../store/useAuthStore';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { LawyerCard, mapLawyerToCardModel } from '../../components/lawyer/LawyerCard';
import { resolveSearchIntent, SEARCH_PLACEHOLDERS } from '../../constants/searchIntentMap';
import { NotificationSheet } from '../../components/notifications/NotificationSheet';
import { useUnreadCount } from '../../store/useNotificationStore';
import { useWalletStore } from '../../store/useWalletStore';
import { generateSuggestions, type SearchSuggestion } from '../../constants/lawyerSearchSuggestions';
import { useLawyerDataStore } from '../../store/useLawyerDataStore';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { generateLegalResponse } from '../../src/services/legalResponseEngine';
import { LEGAL_SYSTEM } from '../../src/data/legalSystem';
import { findLegalIntent, searchLegalItems } from '../../src/utils/searchEngine';
import { analyzeLegalItem, smartSearchParams } from '../../src/services/smartLegalSearchService';
import { type Item } from '../../src/data/legalSystem';

// --- Category accent colours (for dropdown) ----------------------------------
const CAT_ACCENT: Partial<Record<string, string>> = {
  criminal: '#F85149',
  family: '#FF9F43',
  property: '#3FB950',
  employment: '#58A6FF',
  civil: '#F5A623',
  corporate: '#A78BFA',
  cyber: '#60A5FA',
  tax: '#34D399',
};

const SYSTEM_CATEGORY_BY_LAWYER_CATEGORY: Record<string, string> = {
  criminal: 'criminal-law',
  family: 'family-law',
  property: 'property-law',
  employment: 'labour-law',
  civil: 'civil-law',
  corporate: 'corporate-law',
  consumer: 'consumer-law',
  cyber: 'cyber-law',
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
  const expertCardWidth = 260; // Premium card width
  const topCardWidth = 260; // Premium card width
  const listGap = 16;

  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const HOME_LEGAL_CATEGORIES = [
    { id: "1", title: "Criminal", type: "Criminal", icon: "gavel", color: "#F85149" },
    { id: "2", title: "Civil", type: "Civil", icon: "balance", color: "#F5A623" },
    { id: "3", title: "Startup", type: "Corporate", icon: "business", color: "#A78BFA" },
    { id: "4", title: "Consumer", type: "Consumer", icon: "shopping-cart", color: "#3FB950" },
    { id: "5", title: "Property", type: "Property", icon: "home", color: "#60A5FA" },
    { id: "6", title: "Cyber Crime", type: "Cyber", icon: "security", color: "#8B5CF6" },
    { id: "7", title: "Tax", type: "Tax", icon: "attach-money", color: "#34D399" },
    { id: "8", title: "Divorce", type: "Family", icon: "people", color: "#FF9F43" },
    { id: "9", title: "FIR", type: "Criminal", icon: "local-police", color: "#F85149" },
    { id: "10", title: "Employment", type: "Employment", icon: "work", color: "#58A6FF" },
  ];

  if (!HOME_LEGAL_CATEGORIES) return null;
  const unreadCount = useUnreadCount();
  const { balance } = useWalletStore();
  const [notifSheetOpen, setNotifSheetOpen] = useState(false);
  const { featuredLawyers, hydrateLawyerData, hydrated, preloadLawyerData } = useLawyerDataStore();
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const expertsScrollX = useRef(new Animated.Value(0)).current;
  const topRatedScrollX = useRef(new Animated.Value(0)).current;
  const categoryScrollX = useRef(new Animated.Value(0)).current;
  const [activeExpert, setActiveExpert] = useState(0);
  const [activeTopRated, setActiveTopRated] = useState(0);
  const [activeCategory, setActiveCategory] = useState(0);

  const liveExperts = featuredLawyers ? featuredLawyers.filter((l) => l.isOnline) : [];
  const topRated = featuredLawyers ? [...featuredLawyers].sort((a, b) => b.rating.average - a.rating.average) : [];

  const [searchText, setSearchText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [smartResults, setSmartResults] = useState<Item[]>([]);

  const [routeSheetMounted, setRouteSheetMounted] = useState(false);
  const [selectedSug, setSelectedSug] = useState<SearchSuggestion | null>(null);
  const routeSheetAnim = useRef(new Animated.Value(0)).current;
  const dropFade = useRef(new Animated.Value(0)).current;
  const fixedTopH = 110;

  useFocusEffect(
    useCallback(() => {
      // Reset search state on focus
      setSearchText('');
      setSuggestions([]);
      setShowDropdown(false);

      if (!hydrated) {
        hydrateLawyerData();
      } else if (isFirstLoad) {
        setIsFirstLoad(false);
      }
    }, [hydrateLawyerData, hydrated, isFirstLoad]),
  );

  const openLawyers = (params?: any) => router.push({ pathname: '/(tabs)/lawyers', params });
  const openRouteSheet = (sug: SearchSuggestion) => {
    setSelectedSug(sug);
    setRouteSheetMounted(true);
    Animated.spring(routeSheetAnim, { toValue: 1, useNativeDriver: false }).start();
  };
  const closeRouteSheet = () => {
    Animated.timing(routeSheetAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start(() => {
      setRouteSheetMounted(false);
      setSelectedSug(null);
    });
  };
  const goToLawyers = () => {
    if (!selectedSug) return;
    closeRouteSheet();
    router.push({ pathname: '/(tabs)/lawyers', params: { category: selectedSug.category } });
  };

  const handleCategoryPress = (item: any) => {
    const categoryMap: Record<string, string> = {
      "Criminal Law": "Criminal Law",
      "Civil Law": "Civil Law",
      "Startup Legal": "Corporate Law",
      "Tax & GST": "Tax Law",
      "Cyber Crime": "Cyber Law",
      "Consumer Court": "Consumer Law",
      "Property": "Property Law",
      "Employment": "Employment Law",
      "Divorce": "Family Law",
      "FIR / Police": "Criminal Law",
      "Documentation": "Document Law",
      "Court Matter": "Court Law",
    };

    const selectedCategory = categoryMap[item.title] || item.title;

    // 🔥 DIRECTLY GO TO LAWYERS (NOT legal-category)
    router.push({
      pathname: "/(tabs)/lawyers",
      params: { category: selectedCategory },
    });
  };

  const handleSearch = (query: string) => {
    if (!query) return;
    setSearchText(query);
    setShowDropdown(false);
    router.push({
      pathname: '/legal-insight',
      params: { query },
    });
  };

  return (
    <TouchableWithoutFeedback onPress={() => {
      Keyboard.dismiss();
      setShowDropdown(false);
    }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bgPrimary }}>
        <View style={s.root}>
          {/* HEADER & SEARCH (FIXED TOP) */}
          <View style={s.fixedTop}>
            <View style={s.header}>
              <Text style={s.logo}>
                Law<Text style={s.logoAccent}>24</Text>
              </Text>
              <View style={s.headerIcons}>
                <TouchableOpacity style={s.iconBtn} onPress={() => router.push('/profile/add-money')} activeOpacity={0.7} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <MaterialIcons name="account-balance-wallet" size={20} color={Colors.gold} />
                  <Text style={s.walletAmt}>₹{balance.toLocaleString('en-IN')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.iconBtn} onPress={() => setNotifSheetOpen(true)} activeOpacity={0.7} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <MaterialIcons name="notifications-none" size={22} color={Colors.textPrimary} />
                  {unreadCount > 0 && (
                    <View style={s.bellBadge}>
                      <Text style={s.bellBadgeTxt}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={[s.searchRow, showDropdown && s.searchRowFocused]}>
              <MaterialIcons name="search" size={20} color={showDropdown ? Colors.primary : Colors.textTertiary} />
              <View style={s.searchInputWrap}>
                {!searchText && <Text style={s.searchPlaceholder}>{SEARCH_PLACEHOLDERS[0]}</Text>}
                <TextInput
                  style={s.searchInput}
                  value={searchText}
                  onChangeText={(t) => {
                    setSearchText(t);
                    const sugs = generateSuggestions(t);
                    const smrts = searchLegalItems(t, LEGAL_SYSTEM || []);
                    setSuggestions(sugs || []);
                    setSmartResults(smrts || []);
                    const hasSomething = (sugs?.length > 0) || (smrts?.length > 0);
                    setShowDropdown(hasSomething);
                    Animated.timing(dropFade, { toValue: hasSomething ? 1 : 0, duration: 200, useNativeDriver: false }).start();
                  }}
                  onFocus={() => {
                    if (suggestions.length > 0 || smartResults.length > 0) {
                      setShowDropdown(true);
                      Animated.timing(dropFade, { toValue: 1, duration: 200, useNativeDriver: false }).start();
                    }
                  }}
                  onBlur={() => {
                    setTimeout(() => setShowDropdown(false), 150);
                  }}
                  placeholderTextColor="transparent"
                  autoCorrect={false}
                  autoCapitalize="none"
                  autoFocus={false}
                  blurOnSubmit={false}
                  returnKeyType="search"
                  onSubmitEditing={() => handleSearch(searchText)}
                />
              </View>
              <TouchableOpacity style={s.micBtn} activeOpacity={0.7} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <MaterialIcons name="mic-none" size={20} color={Colors.textTertiary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* MAIN SCROLLABLE CONTENT */}
          <ScrollView
            style={s.scroll}
            contentContainerStyle={s.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={s.greeting}>
              {getGreeting()}, {user?.name?.split(' ')[0] ?? 'there'}
            </Text>

            <View style={s.section}>
              <SectionHeader title="Top Categories" onAction={() => router.push('/legal-categories')} />
              <FlatList
                data={HOME_LEGAL_CATEGORIES}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={s.catListFullBleed}
                contentContainerStyle={s.catListContainer}
                snapToAlignment="start"
                decelerationRate="fast"
                snapToInterval={100 + 12}
                bounces={false}
                removeClippedSubviews
                initialNumToRender={5}
                windowSize={5}
                ListFooterComponent={<View style={{ width: 16 }} />}
                getItemLayout={(_, index) => ({
                  length: 100 + 12,
                  offset: (100 + 12) * index,
                  index,
                })}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={s.catCard}
                    activeOpacity={0.8}
                    onPress={() => handleCategoryPress(item)}
                    hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
                  >
                    <View style={[s.catIcon, { backgroundColor: `${item.color}22` }]}>
                      <MaterialIcons name={item.icon as any} size={20} color={item.color} />
                    </View>
                    <Text style={s.catLabel} numberOfLines={2}>
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>

            {/* Nyaya AI Premium Card */}
            <View style={s.nyayaCard}>
              <LinearGradient
                colors={['rgba(15,23,42,0.98)', 'rgba(10,15,30,0.98)']}
                style={s.nyayaGradient}
              >
                <View style={s.nyayaHeader}>
                  <View style={s.nyayaIconWrap}>
                    <MaterialIcons name="auto-awesome" size={28} color={Colors.gold} />
                  </View>
                  <View>
                    <Text style={s.nyayaTitle}>NyayaAI</Text>
                    <Text style={s.nyayaTag}>Advanced Legal Intelligence</Text>
                  </View>
                </View>

                <Text style={s.nyayaDesc}>
                  Describe your legal problem in Hindi or English. We help you understand your rights and next steps instantly.
                </Text>

                <View style={s.nyayaPoints}>
                  <View style={s.nyayaPoint}>
                    <MaterialIcons name="check-circle" size={16} color={Colors.success} />
                    <Text style={s.nyayaPointTxt}>Understand your situation clearly</Text>
                  </View>
                  <View style={s.nyayaPoint}>
                    <MaterialIcons name="check-circle" size={16} color={Colors.success} />
                    <Text style={s.nyayaPointTxt}>Know your legal rights</Text>
                  </View>
                  <View style={s.nyayaPoint}>
                    <MaterialIcons name="check-circle" size={16} color={Colors.success} />
                    <Text style={s.nyayaPointTxt}>Get actionable next steps</Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => router.push('/nyaya')}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#5B5FFB', '#7A5CFF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={s.nyayaBtn}
                  >
                    <Text style={s.nyayaBtnTxt}>Start Case Analysis</Text>
                    <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </View>

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
                removeClippedSubviews
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
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: expertsScrollX } } }], { useNativeDriver: false })}
                scrollEventThrottle={16}
                renderItem={({ item, index }) => {
                  const inputRange = [
                    (index - 1) * (expertCardWidth + listGap),
                    index * (expertCardWidth + listGap),
                    (index + 1) * (expertCardWidth + listGap),
                  ];
                  const scale = expertsScrollX.interpolate({
                    inputRange,
                    outputRange: [0.9, 1.05, 0.9],
                    extrapolate: 'clamp',
                  });
                  const opacity = expertsScrollX.interpolate({ inputRange, outputRange: [0.7, 1, 0.7], extrapolate: 'clamp' });

                  return (
                    <Animated.View
                      style={[
                        { width: expertCardWidth, marginRight: listGap, opacity, transform: [{ scale }] },
                      ]}
                    >
                      <LawyerCard
                        data={mapLawyerToCardModel(item as any)}
                        onPress={() => {
                          router.push({ pathname: '/lawyer/[id]', params: { id: String(item.id) } });
                        }}
                      />
                    </Animated.View>
                  );
                }}
              />
            </View>

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
                removeClippedSubviews
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
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: topRatedScrollX } } }], { useNativeDriver: false })}
                scrollEventThrottle={16}
                renderItem={({ item, index }) => {
                  const inputRange = [
                    (index - 1) * (topCardWidth + listGap),
                    index * (topCardWidth + listGap),
                    (index + 1) * (topCardWidth + listGap),
                  ];
                  const scale = topRatedScrollX.interpolate({ inputRange, outputRange: [0.9, 1.05, 0.9], extrapolate: 'clamp' });
                  const opacity = topRatedScrollX.interpolate({ inputRange, outputRange: [0.7, 1, 0.7], extrapolate: 'clamp' });

                  return (
                    <Animated.View
                      style={[
                        { width: topCardWidth, marginRight: listGap, opacity, transform: [{ scale }] },
                      ]}
                    >
                      <LawyerCard
                        data={mapLawyerToCardModel(item as any)}
                        onPress={() => {
                          router.push({ pathname: '/lawyer/[id]', params: { id: String(item.id) } });
                        }}
                      />
                    </Animated.View>
                  );
                }}
              />
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>

          {/* ABSOLUTE OVERLAYS */}
          {showDropdown && (
            <View style={s.suggestionsWrapper} pointerEvents="box-none">
              <Text style={s.aiIntro}>
                Nyaya AI helps you understand your legal problem, know your rights, and get actionable next steps instantly.
              </Text>
              <Animated.View
                style={[
                  s.dropWrap,
                  { opacity: dropFade }
                ]}
              >
                <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                  {smartResults.map((item, idx) => (
                    <TouchableOpacity
                      key={`smart-${idx}`}
                      style={s.suggestionItem}
                      onPress={() => {
                        setSearchText(item.title);
                        setShowDropdown(false);
                        router.push({ pathname: '/legal-insight', params: { query: item.title } });
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={s.iconBox}>
                        <MaterialIcons name="auto-awesome" size={18} color="#8B5CF6" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.suggestionTitle}>{item.title}</Text>
                        <Text style={s.suggestionSubtitle}>{item.description || "Legal guidance"}</Text>
                      </View>
                      <MaterialIcons name="north-east" size={16} color="#94A3B8" />
                    </TouchableOpacity>
                  ))}
                  {suggestions.map((sug, idx) => (
                    <TouchableOpacity
                      key={sug.id}
                      style={s.suggestionItem}
                      onPress={() => {
                        setSearchText(sug.display);
                        setShowDropdown(false);
                        router.push({ pathname: '/legal-insight', params: { query: sug.display } });
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={s.iconBox}>
                        <MaterialIcons name={sug.icon as any || "search"} size={18} color="#8B5CF6" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.suggestionTitle}>{sug.display}</Text>
                        <Text style={s.suggestionSubtitle}>{sug.sub || "Legal search result"}</Text>
                      </View>
                      <MaterialIcons name="north-west" size={16} color="#94A3B8" />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </Animated.View>
            </View>
          )}

          {routeSheetMounted && selectedSug && (() => {
            const accent = selectedSug.category ? (CAT_ACCENT[selectedSug.category] ?? "#4F6BFF") : "#4F6BFF";
            const sheetTranslate = routeSheetAnim.interpolate({ inputRange: [0, 1], outputRange: [300, 0] });
            const backdropOpacity = routeSheetAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.55] });
            return (
              <>
                <Animated.View
                  style={[StyleSheet.absoluteFillObject, { backgroundColor: "#000", opacity: backdropOpacity }]}
                  pointerEvents="auto"
                >
                  <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={closeRouteSheet} activeOpacity={1} />
                </Animated.View>
                <Animated.View style={[s.routeSheet, { transform: [{ translateY: sheetTranslate }] }]}>
                  <View style={s.routeHandle} />
                  <View style={[s.routeQueryRow, { borderLeftColor: accent }]}>
                    <View style={[s.routeQueryIcon, { backgroundColor: accent + "22" }]}>
                      <MaterialIcons name={selectedSug.icon as any} size={16} color={accent} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.routeQueryText} numberOfLines={1}>
                        {selectedSug.display}
                      </Text>
                      {selectedSug.sub ? <Text style={s.routeQuerySub}>{selectedSug.sub}</Text> : null}
                    </View>
                    <TouchableOpacity onPress={closeRouteSheet} hitSlop={12}>
                      <MaterialIcons name="close" size={18} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                  <Text style={s.routeChoiceLabel}>HOW WOULD YOU LIKE TO PROCEED?</Text>
                  <TouchableOpacity style={s.routeCard} onPress={goToLawyers} activeOpacity={0.85}>
                    <View style={[s.routeCardIcon, { backgroundColor: "#4F6BFF22" }]}>
                      <MaterialIcons name="people" size={22} color="#4F6BFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.routeCardTitle}>Talk to a Lawyer</Text>
                      <Text style={s.routeCardSub}>Find {selectedSug.category ?? "a"} lawyer · Browse experts</Text>
                    </View>
                    <MaterialIcons name="arrow-forward-ios" size={14} color="#6B7280" />
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.routeCard, s.routeCardAI]} onPress={() => {
                    if (!selectedSug) return;
                    closeRouteSheet();
                    router.push({ pathname: '/nyaya', params: { query: selectedSug.display, autoSend: '1' } });
                  }} activeOpacity={0.85}>
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

          <NotificationSheet visible={notifSheetOpen} onClose={() => setNotifSheetOpen(false)} />
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgPrimary, overflow: 'hidden' },
  fixedTop: {
    backgroundColor: Colors.bgPrimary,
    paddingHorizontal: ScreenSpacing.horizontal,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  logo: { ...T.h2, fontSize: 22, letterSpacing: 0.3 },
  logoAccent: { color: Colors.primary },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  iconBtn: { position: 'relative', padding: 7, flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  walletAmt: { ...T.captionSm, color: Colors.textSecondary, fontWeight: '700' },
  bellBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: Colors.bgPrimary,
  },
  bellBadgeTxt: { fontSize: 9, fontWeight: '800', color: '#fff' },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glassMedium,
    borderRadius: Radius.input,
    paddingHorizontal: CardSpacing.compact,
    height: 52,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    zIndex: 10,
    ...Platform.select({
      web: { backdropFilter: 'blur(10px)' },
    }),
  },
  searchRowFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.glassDark,
    ...Shadow.glow,
  },
  searchInputWrap: { flex: 1, justifyContent: 'center' },
  searchPlaceholder: {
    position: 'absolute',
    ...T.bodySm,
    color: Colors.textTertiary,
    pointerEvents: 'none',
  },
  searchInput: { flex: 1, color: Colors.textPrimary, ...T.body, paddingVertical: 0 },
  micBtn: { padding: 2 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: ScreenSpacing.horizontal, paddingTop: 24, paddingBottom: 100 },
  greeting: { ...T.h4, marginBottom: SectionSpacing.small, letterSpacing: 0.3 },
  suggestionsWrapper: {
    position: 'absolute',
    top: 110,
    left: 16,
    right: 16,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    paddingVertical: 8,
    maxHeight: 400,
    zIndex: 50,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  aiIntro: {
    color: '#94A3B8',
    fontSize: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    lineHeight: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  dropWrap: {
    maxHeight: 320,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  suggestionSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 1,
  },
  routeSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.bgSecondary,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    zIndex: 50,
    elevation: 40,
  },
  routeHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  routeQueryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderLeftWidth: 3,
    paddingLeft: 10,
    backgroundColor: Colors.bgElevated,
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  routeQueryIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  routeQueryText: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  routeQuerySub: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },
  routeChoiceLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  routeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.bgElevated,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  routeCardAI: { borderColor: Colors.goldSubtle, backgroundColor: 'rgba(245,166,35,0.05)' },
  routeCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  routeCardTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  routeCardSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  section: { marginBottom: 32 },
  listFullBleed: { marginTop: 16, overflow: 'visible' },
  listContainer: { paddingHorizontal: 24, paddingRight: 24, overflow: 'visible' },
  catListFullBleed: { marginTop: 16 },
  catListContainer: { paddingHorizontal: 24, paddingRight: 4, gap: 12 },
  catCard: {
    width: 100,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    backgroundColor: Colors.bgSecondary,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.md,
    gap: Spacing.sm,
    ...Shadow.elevated,
  },
  catIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 4,
  },
  catLabel: {
    fontSize: 11,
    color: Colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 13,
    letterSpacing: 0.2,
  },
  dropdown: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 105 : 100,
    left: 16,
    right: 16,
    backgroundColor: '#121826',
    borderRadius: 16,
    maxHeight: 300,
    zIndex: 1000,
    elevation: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  dropItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  dropIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(79,110,247,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dropTitle: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600' },
  dropDesc: { color: Colors.textSecondary, fontSize: 11, marginTop: 2 },
  dropText: { color: Colors.textSecondary, fontSize: 13 },
  nyayaCard: {
    marginBottom: 24,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(15,23,42,0.98)',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 16,
  },
  nyayaGradient: { padding: 24 },
  nyayaHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  nyayaIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(245,166,35,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245,166,35,0.2)',
  },
  nyayaTitle: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, letterSpacing: 0.5 },
  nyayaTag: { fontSize: 12, color: Colors.gold, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1.2, marginTop: 2 },
  nyayaDesc: { fontSize: 15, color: Colors.textSecondary, lineHeight: 24, marginBottom: 20, marginTop: 8 },
  nyayaPoints: { gap: 12, marginBottom: 24 },
  nyayaPoint: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  nyayaPointTxt: { fontSize: 14, color: Colors.textPrimary, fontWeight: '500', flex: 1 },
  nyayaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  nyayaBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  homeLawyerRow1: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  homeLawyerName: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  homeLawyerDetails: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '400',
  },
  homeLawyerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  homeLawyerRatingText: {
    color: Colors.gold,
    fontSize: 13,
    fontWeight: '500',
  },
  homeLawyerAvailability: {
    color: Colors.success,
    fontSize: 13,
  },
  homeLawyerButton: {
    height: 44,
    width: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeLawyerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  expertCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'stretch',
  },
  topCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'stretch',
  },
  activeGlow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.38,
    shadowRadius: 10,
    elevation: 7,
  },
});
