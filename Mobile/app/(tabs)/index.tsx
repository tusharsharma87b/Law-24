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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { LawyerCard, mapLawyerToCardModel } from '../../components/lawyer/LawyerCard';
import { HOME_LEGAL_CATEGORIES } from '../../constants/homeLegalCategories';
import { MOCK_LAWYERS } from '../../constants/mockData';
import { DIRECTORY_LAWYERS } from '../../constants/lawyersDirectory';
import { useAuthStore } from '../../store/useAuthStore';
import { SectionHeader } from '../../components/ui/SectionHeader';
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
  const expertCardWidth = viewportWidth * 0.6;
  const topCardWidth = viewportWidth * 0.6;
  const listGap = 12;

  const router = useRouter();
  const user = useAuthStore((s) => s.user);
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

  const liveExperts = (featuredLawyers || MOCK_LAWYERS).filter((l) => l.isOnline);
  const topRated = [...(featuredLawyers || MOCK_LAWYERS)].sort((a, b) => b.rating.average - a.rating.average);

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
  const goToNyaya = () => {
    if (!selectedSug) return;
    closeRouteSheet();
    router.push({ pathname: '/nyaya', params: { query: selectedSug.display, autoSend: '1' } });
  };

  const handleSelectSmartResult = (item: Item) => {
    setShowDropdown(false);
    setSearchText('');
    router.push({
      pathname: '/nyaya',
      params: { 
        query: item.title,
        aiPrompt: item.aiPrompt,
        autoSend: '1'
      }
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={s.root}>
        <SafeAreaView edges={['top']} style={s.fixedTop}>
          <View style={s.header}>
            <Text style={s.logo}>
              Law<Text style={s.logoAccent}>24</Text>
            </Text>
            <View style={s.headerIcons}>
              <TouchableOpacity style={s.iconBtn} onPress={() => router.push('/profile/add-money')} activeOpacity={0.7}>
                <MaterialIcons name="account-balance-wallet" size={20} color={Colors.gold} />
                <Text style={s.walletAmt}>₹{balance.toLocaleString('en-IN')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.iconBtn} onPress={() => setNotifSheetOpen(true)} activeOpacity={0.7}>
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
                  const smrts = searchLegalItems(t, LEGAL_SYSTEM);
                  setSuggestions(sugs);
                  setSmartResults(smrts);
                  const hasSomething = sugs.length > 0 || smrts.length > 0;
                  setShowDropdown(hasSomething);
                  Animated.timing(dropFade, { toValue: hasSomething ? 1 : 0, duration: 200, useNativeDriver: false }).start();
                }}
                onFocus={() => {
                  if (suggestions.length > 0) {
                    setShowDropdown(true);
                    Animated.timing(dropFade, { toValue: 1, duration: 200, useNativeDriver: false }).start();
                  }
                }}
                placeholderTextColor="transparent"
                autoCorrect={false}
                autoCapitalize="none"
              />
            </View>
            <TouchableOpacity style={s.micBtn}>
              <MaterialIcons name="mic-none" size={20} color={Colors.textTertiary} />
            </TouchableOpacity>
          </View>

          {/* Smart Search Dropdown */}
          {showDropdown && (
            <Animated.View style={[s.dropdown, { opacity: dropFade }]}>
              <ScrollView keyboardShouldPersistTaps="handled">
                {smartResults.map((item, idx) => (
                  <TouchableOpacity 
                    key={`smart-${idx}`} 
                    style={s.dropItem}
                    onPress={() => handleSelectSmartResult(item)}
                  >
                    <View style={s.dropIcon}>
                      <MaterialIcons name="auto-awesome" size={16} color={Colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.dropTitle}>{item.title}</Text>
                      <Text style={s.dropDesc} numberOfLines={1}>{item.description}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
                {suggestions.map((sug, idx) => (
                  <TouchableOpacity 
                    key={`sug-${idx}`} 
                    style={s.dropItem}
                    onPress={() => openRouteSheet(sug)}
                  >
                    <MaterialIcons name="search" size={16} color={Colors.textTertiary} style={{ marginRight: 12 }} />
                    <Text style={s.dropText}>{sug.display}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>
          )}
        </SafeAreaView>

        <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          <Text style={s.greeting}>
            {getGreeting()}, {user?.name?.split(' ')[0] ?? 'there'}
          </Text>

          <View style={s.section}>
            <SectionHeader title="Top Categories" onAction={() => router.push('/legal-categories')} />
            <Animated.FlatList
              data={HOME_LEGAL_CATEGORIES}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={s.catListFullBleed}
              contentContainerStyle={s.catListContainer}
              onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: categoryScrollX } } }], {
                useNativeDriver: false,
              })}
              scrollEventThrottle={16}
              renderItem={({ item, index }) => {
                const inputRange = [(index - 1) * 100, index * 100, (index + 1) * 100];
                const scale = categoryScrollX.interpolate({ inputRange, outputRange: [0.95, 1, 0.95], extrapolate: 'clamp' });
                const opacity = categoryScrollX.interpolate({ inputRange, outputRange: [0.7, 1, 0.7], extrapolate: 'clamp' });

                return (
                  <Animated.View
                    style={[
                      s.catCardWrap,
                      {
                        width: categoryCardWidth,
                        opacity,
                        transform: [{ scale }],
                      },
                      index === activeCategory && s.activeGlow,
                    ]}
                  >
                    <TouchableOpacity
                      style={[s.catCard, { height: categoryCardHeight }]}
                      activeOpacity={0.8}
                      onPress={() => {
                        const categoryId = SYSTEM_CATEGORY_BY_LAWYER_CATEGORY[item.categoryParam] ?? 'civil-law';
                        router.push({ pathname: '/categories/[id]', params: { id: categoryId } } as any);
                      }}
                    >
                      <View style={[s.catIcon, { backgroundColor: item.color + '22' }]}>
                        <MaterialIcons name={item.icon as any} size={18} color={item.color} />
                      </View>
                      <Text style={s.catLabel} numberOfLines={2}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                );
              }}
            />
          </View>

          {/* Nyaya AI Premium Card */}
          <View style={s.nyayaCard}>
            <LinearGradient
              colors={['#1E293B', '#0F172A']}
              style={s.nyayaGradient}
            >
              <View style={s.nyayaHeader}>
                <View style={s.nyayaIconWrap}>
                  <MaterialIcons name="auto-awesome" size={24} color={Colors.gold} />
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
                  <MaterialIcons name="check-circle" size={14} color={Colors.success} />
                  <Text style={s.nyayaPointTxt}>Understand your situation clearly</Text>
                </View>
                <View style={s.nyayaPoint}>
                  <MaterialIcons name="check-circle" size={14} color={Colors.success} />
                  <Text style={s.nyayaPointTxt}>Know your legal rights</Text>
                </View>
                <View style={s.nyayaPoint}>
                  <MaterialIcons name="check-circle" size={14} color={Colors.success} />
                  <Text style={s.nyayaPointTxt}>Get actionable next steps</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={s.nyayaBtn} 
                onPress={() => router.push('/nyaya')}
                activeOpacity={0.8}
              >
                <Text style={s.nyayaBtnTxt}>Start Case Analysis</Text>
                <MaterialIcons name="arrow-forward" size={18} color="#fff" />
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
                      s.expertCard,
                      { width: expertCardWidth, marginRight: listGap, opacity, transform: [{ scale }] },
                      index === activeExpert && s.activeGlow,
                    ]}
                  >
                    <LawyerCard
                      data={mapLawyerToCardModel(item)}
                      onPress={() => {
                        preloadLawyerData(item.id);
                        router.push({ pathname: '/lawyer/[id]', params: { id: item.id } } as any);
                      }}
                      ctaLabel="Talk Now"
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
                      s.topCard,
                      { width: topCardWidth, marginRight: listGap, opacity, transform: [{ scale }] },
                      index === activeTopRated && s.activeGlow,
                    ]}
                  >
                    <LawyerCard
                      data={mapLawyerToCardModel(item)}
                      onPress={() => {
                        preloadLawyerData(item.id);
                        router.push({ pathname: '/lawyer/[id]', params: { id: item.id } } as any);
                      }}
                      ctaLabel="Consult"
                    />
                  </Animated.View>
                );
              }}
            />
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {(showDropdown || suggestions.length > 0) && (
          <Animated.View
            style={[
              s.dropWrap,
              { top: fixedTopH, opacity: dropFade, pointerEvents: showDropdown ? 'auto' : 'none' } as any,
            ]}
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
                  <View style={[s.dropIcon, { backgroundColor: accent + '1A' }]}>
                    <MaterialIcons name={sug.icon as any} size={13} color={accent} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={s.dropDisplay} numberOfLines={1}>
                      {sug.display}
                    </Text>
                    {sug.sub ? (
                      <Text style={s.dropSub} numberOfLines={1}>
                        {sug.sub}
                      </Text>
                    ) : null}
                  </View>
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

        {routeSheetMounted &&
          selectedSug &&
          (() => {
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

        <NotificationSheet visible={notifSheetOpen} onClose={() => setNotifSheetOpen(false)} />
      </View>
    </TouchableWithoutFeedback>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgPrimary, overflow: 'hidden' },
  fixedTop: {
    backgroundColor: Colors.bgPrimary,
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    zIndex: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  logo: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, letterSpacing: 0.3 },
  logoAccent: { color: Colors.primary },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  iconBtn: { position: 'relative', padding: 7, flexDirection: 'row', alignItems: 'center', gap: 4 },
  walletAmt: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary },
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
    backgroundColor: Colors.bgSecondary,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 44,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchRowFocused: { borderColor: Colors.primary, backgroundColor: '#0A0F1E' },
  searchInputWrap: { flex: 1, justifyContent: 'center' },
  searchPlaceholder: {
    position: 'absolute',
    fontSize: 13,
    color: Colors.textTertiary,
    pointerEvents: 'none',
  },
  searchInput: { flex: 1, color: Colors.textPrimary, fontSize: 13, paddingVertical: 0 },
  micBtn: { padding: 2 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 100 },
  greeting: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, marginBottom: 16 },
  dropWrap: {
    position: 'absolute',
    left: 12,
    right: 12,
    backgroundColor: Colors.bgSecondary,
    borderRadius: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: '50%',
    zIndex: 200,
    elevation: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    overflow: 'hidden',
  },
  dropRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  dropRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle },
  dropIcon: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  dropDisplay: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  dropSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },
  dropCat: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    flexShrink: 0,
  },
  dropCatTxt: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
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
  section: { marginBottom: 20 },
  listFullBleed: { marginTop: 14, marginHorizontal: -16 },
  listContainer: { paddingHorizontal: 16 },
  catListFullBleed: { marginTop: 14, marginHorizontal: -16 },
  catListContainer: { paddingLeft: 16, paddingRight: 6 },
  catCardWrap: { marginRight: 10 },
  catCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: Colors.bgSecondary,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  catIcon: { width: 34, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  catLabel: { fontSize: 11, color: Colors.textPrimary, fontWeight: '500', textAlign: 'center' },
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
  nyayaCard: { marginBottom: 24, borderRadius: 20, overflow: 'hidden' },
  nyayaGradient: { padding: 20 },
  nyayaHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  nyayaIconWrap: { 
    width: 48, 
    height: 48, 
    borderRadius: 14, 
    backgroundColor: 'rgba(245,166,35,0.1)', 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245,166,35,0.2)',
  },
  nyayaTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, letterSpacing: 0.5 },
  nyayaTag: { fontSize: 11, color: Colors.gold, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  nyayaDesc: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22, marginBottom: 18 },
  nyayaPoints: { gap: 10, marginBottom: 20 },
  nyayaPoint: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  nyayaPointTxt: { fontSize: 13, color: Colors.textPrimary, fontWeight: '500' },
  nyayaBtn: { 
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nyayaBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
  expertCard: { alignItems: 'stretch' },
  topCard: { alignItems: 'stretch' },
  activeGlow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.38,
    shadowRadius: 10,
    elevation: 7,
  },
});
