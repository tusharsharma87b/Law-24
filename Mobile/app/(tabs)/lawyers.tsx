import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { LawyerCard, mapLawyerToCardModel } from '../../components/lawyer/LawyerCard';
import { useLawyerDataStore } from '../../store/useLawyerDataStore';

const CATEGORIES = [
  'All',
  'Criminal',
  'Civil',
  'Startup',
  'Consumer',
  'Property',
  'Cyber Crime',
  'Tax',
  'Divorce',
  'FIR',
  'Employment',
];

const FILTER_PILLS = [
  { key: 'online', label: 'Online Now', icon: 'wifi' },
  { key: 'verified', label: 'Verified', icon: 'verified' },
  { key: 'hindi', label: 'Hindi', icon: 'language' },
  { key: 'english', label: 'English', icon: 'language' },
  { key: 'rating', label: 'Top Rated', icon: 'star' },
  { key: 'price', label: 'Low Fee', icon: 'attach-money' },
  { key: 'experience', label: 'High Experience', icon: 'work' },
];

export default function LawyersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string }>();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSort, setActiveSort] = useState('rating');

  const [activeCategory, setActiveCategory] = useState(
    params.category || 'All'
  );

  // Filter states
  const [filters, setFilters] = useState({
    minRating: 0,
    priceSort: 'none', // 'none', 'lowToHigh', 'highToLow'
    onlineOnly: false,
    minExperience: 0,
    verifiedOnly: false,
    hindiOnly: false,
    englishOnly: false,
  });

  // Lawyer data from store (single source of truth)
  const { featuredLawyers, isHydrating, hydrateLawyerData } = useLawyerDataStore();
  const lawyers = featuredLawyers || [];

  useEffect(() => {
    hydrateLawyerData();
  }, [hydrateLawyerData]);

  const filteredLawyers = useMemo(() => {
    let result = lawyers.filter((lawyer) => {
      // Determine expertise from first specialization
      const expertise = lawyer.specializations[0] || 'General Law';
      if (activeCategory !== 'All' && expertise !== activeCategory) {
        return false;
      }

      // Rating filter
      if (filters.minRating > 0 && lawyer.rating.average < filters.minRating) {
        return false;
      }

      // Online only filter: use isOnline boolean
      if (filters.onlineOnly && !lawyer.isOnline) {
        return false;
      }

      // Experience filter
      if (filters.minExperience > 0 && lawyer.experienceYears < filters.minExperience) {
        return false;
      }

      // Verified filter (mock - assuming lawyer has isVerified property)
      if (filters.verifiedOnly && !(lawyer as any).isVerified) {
        return false;
      }

      // Language filters (mock - assuming lawyer has languages array)
      if (filters.hindiOnly && !(lawyer as any).languages?.includes('Hindi')) {
        return false;
      }
      if (filters.englishOnly && !(lawyer as any).languages?.includes('English')) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        return (
          lawyer.name.toLowerCase().includes(query) ||
          expertise.toLowerCase().includes(query) ||
          lawyer.specializations.some((s: string) => s.toLowerCase().includes(query))
        );
      }

      return true;
    });

    // Price sorting
    if (filters.priceSort === 'lowToHigh') {
      result.sort((a: any, b: any) => a.fees.chatPerMinuteInr - b.fees.chatPerMinuteInr);
    } else if (filters.priceSort === 'highToLow') {
      result.sort((a: any, b: any) => b.fees.chatPerMinuteInr - a.fees.chatPerMinuteInr);
    } else if (activeSort === 'rating') {
      result.sort((a: any, b: any) => b.rating.average - a.rating.average);
    }

    return result;
  }, [activeCategory, filters, searchQuery, activeSort]);

  const resetFilters = () => {
    setActiveCategory('All');
    setSearchQuery('');
    setFilters({
      minRating: 0,
      priceSort: 'none',
      onlineOnly: false,
      minExperience: 0,
      verifiedOnly: false,
      hindiOnly: false,
      englishOnly: false,
    });
    setActiveSort('rating');
  };

  const renderItem = ({ item }: { item: typeof lawyers[0] }) => (
    <LawyerCard
      data={mapLawyerToCardModel(item as any)}
      onPress={() => router.push({
        pathname: "/lawyer/[id]",
        params: { id: item.id }
      })}
    />
  );

  // Show loading indicator while isHydrating and no lawyers yet
  if (isHydrating && lawyers.length === 0) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <MaterialIcons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>Find an Expert</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading lawyers...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Find an Expert</Text>
        </View>
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color="#64748B" />
            <TextInput
              placeholder="Search by name or specialization..."
              placeholderTextColor="#64748B"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
      </View>

      {/* Category Chips - Horizontal Scroll */}
      <View style={styles.filtersScroll}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoriesContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                activeCategory === item && styles.categoryChipActive
              ]}
              onPress={() => setActiveCategory(item)}
              activeOpacity={0.85}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[
                styles.categoryText,
                activeCategory === item && styles.categoryTextActive
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Filter Pills Row - Premium Compact Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterPillsScroll}
        contentContainerStyle={styles.filterPillsContainer}
      >
        {FILTER_PILLS.map((pill) => {
          const isActive =
            (pill.key === 'rating' && filters.minRating >= 4) ||
            (pill.key === 'price' && filters.priceSort === 'lowToHigh') ||
            (pill.key === 'experience' && filters.minExperience >= 10) ||
            (pill.key === 'online' && filters.onlineOnly) ||
            (pill.key === 'verified' && filters.verifiedOnly) ||
            (pill.key === 'hindi' && filters.hindiOnly) ||
            (pill.key === 'english' && filters.englishOnly);
          
          return (
            <TouchableOpacity
              key={pill.key}
              style={[
                styles.filterPill,
                isActive && styles.filterPillActive
              ]}
              onPress={() => {
                if (pill.key === 'rating') {
                  setFilters(prev => ({
                    ...prev,
                    minRating: prev.minRating >= 4 ? 0 : 4
                  }));
                } else if (pill.key === 'price') {
                  setFilters(prev => ({
                    ...prev,
                    priceSort: prev.priceSort === 'none' ? 'lowToHigh' :
                              prev.priceSort === 'lowToHigh' ? 'highToLow' : 'none'
                  }));
                } else if (pill.key === 'experience') {
                  setFilters(prev => ({
                    ...prev,
                    minExperience: prev.minExperience >= 10 ? 0 : 10
                  }));
                } else if (pill.key === 'online') {
                  setFilters(prev => ({
                    ...prev,
                    onlineOnly: !prev.onlineOnly
                  }));
                } else if (pill.key === 'verified') {
                  setFilters(prev => ({
                    ...prev,
                    verifiedOnly: !prev.verifiedOnly
                  }));
                } else if (pill.key === 'hindi') {
                  setFilters(prev => ({
                    ...prev,
                    hindiOnly: !prev.hindiOnly
                  }));
                } else if (pill.key === 'english') {
                  setFilters(prev => ({
                    ...prev,
                    englishOnly: !prev.englishOnly
                  }));
                }
              }}
              activeOpacity={0.85}
            >
              <Text style={[
                styles.filterPillText,
                isActive && styles.filterPillTextActive
              ]}>
                {pill.key === 'price' && filters.priceSort !== 'none'
                  ? `Price ${filters.priceSort === 'lowToHigh' ? '↑' : '↓'}`
                  : pill.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Lawyer Cards List */}
      <FlatList
        data={filteredLawyers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        removeClippedSubviews
        initialNumToRender={10}
        windowSize={10}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="search-off" size={80} color="#4F46E5" />
            <Text style={styles.emptyTitle}>No matching lawyers</Text>
            <Text style={styles.emptySubtitle}>Try changing filters or search</Text>
            <TouchableOpacity onPress={resetFilters} activeOpacity={0.8}>
              <LinearGradient
                colors={['#5B5FFB', '#7A5CFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.resetButton}
              >
                <Text style={styles.resetButtonText}>Reset Filters</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#050816',
  },
  header: {
    padding: 24,
    paddingBottom: 16,
    gap: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15,23,42,0.7)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  filterIconButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(15,23,42,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  filtersScroll: {
    marginBottom: 16,
    marginHorizontal: 24,
  },
  categoriesContainer: {
    paddingHorizontal: 0,
    gap: 10,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    height: 42,
    borderRadius: 24,
    backgroundColor: 'rgba(15,23,42,0.98)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryChipActive: {
    backgroundColor: 'rgba(91, 95, 251, 0.12)',
    borderColor: '#5B5FFB',
    borderWidth: 1.5,
    shadowColor: '#5B5FFB',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  categoryText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  categoryTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  // Filter pills
  filterPillsScroll: {
    marginBottom: 24,
    marginHorizontal: 24,
  },
  filterPillsContainer: {
    gap: 10,
  },
  filterPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    height: 44,
    borderRadius: 24,
    backgroundColor: 'rgba(15,23,42,0.98)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  filterPillActive: {
    backgroundColor: 'rgba(91, 95, 251, 0.12)',
    borderColor: '#5B5FFB',
    borderWidth: 1.5,
    shadowColor: '#5B5FFB',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  filterPillText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    gap: 16,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 16,
    textAlign: 'center',
  },
  listContent: {
    padding: 24,
    paddingBottom: 120,
    gap: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    gap: 20,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  emptySubtitle: {
    color: '#94A3B8',
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  resetButton: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 10,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
