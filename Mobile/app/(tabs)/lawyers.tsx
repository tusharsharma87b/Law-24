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
import { LawyerCard, mapLawyerToCardModel } from '../../components/lawyer/LawyerCard';
import { useLawyerDataStore } from '../../store/useLawyerDataStore';

const CATEGORIES = [
  'All',
  'Criminal Law',
  'Family Law',
  'Corporate Law',
  'Property Law',
  'Civil Law',
  'Employment Law',
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
  });

  // Lawyer data from store (fetched from backend)
  const { featuredLawyers, hydrateLawyerData, isHydrating } = useLawyerDataStore();
  const lawyers = featuredLawyers || [];

  useEffect(() => {
    hydrateLawyerData();
  }, []);

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

      // Search query filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        return (
          lawyer.name.toLowerCase().includes(query) ||
          expertise.toLowerCase().includes(query) ||
          lawyer.specializations.some(s => s.toLowerCase().includes(query))
        );
      }

      return true;
    });

    // Price sorting
    if (filters.priceSort === 'lowToHigh') {
      result.sort((a, b) => a.fees.chatPerMinuteInr - b.fees.chatPerMinuteInr);
    } else if (filters.priceSort === 'highToLow') {
      result.sort((a, b) => b.fees.chatPerMinuteInr - a.fees.chatPerMinuteInr);
    } else if (activeSort === 'rating') {
      result.sort((a, b) => b.rating.average - a.rating.average);
    }

    return result;
  }, [activeCategory, filters, searchQuery, activeSort]);

  // Section data computation
  const sectionData = useMemo(() => {
    // Recommended Lawyers: Top rated + online
    const recommendedLawyers = lawyers
      .filter(lawyer => lawyer.rating.average >= 4.5 && lawyer.isOnline)
      .slice(0, 8);

    // Your Lawyers (previously consulted): Mock data - lawyers with IDs 1-4
    const yourLawyers = lawyers
      .filter(lawyer => ['1', '2', '3', '4'].includes(lawyer.id))
      .slice(0, 6);

    // Recent Conversations: Lawyers with high response time
    const recentConversations = lawyers
      .filter(lawyer => lawyer.responseTimeMinutes <= 5)
      .sort((a, b) => a.responseTimeMinutes - b.responseTimeMinutes)
      .slice(0, 6);

    // Top Rated: Highest rated lawyers
    const topRatedLawyers = [...lawyers]
      .sort((a, b) => b.rating.average - a.rating.average)
      .slice(0, 8);

    return {
      recommendedLawyers,
      yourLawyers,
      recentConversations,
      topRatedLawyers,
    };
  }, [lawyers]);

  const renderItem = ({ item }: { item: typeof lawyers[0] }) => (
    <LawyerCard
      data={mapLawyerToCardModel(item as any)}
      onPress={() => router.push({
        pathname: "/lawyer/[id]",
        params: { id: item.id }
      })}
    />
  );

  const renderHorizontalSection = (title: string, data: typeof lawyers) => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity>
          <Text style={styles.sectionSeeAll}>See all</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.horizontalListContent}
      />
    </View>
  );

  // Show loading indicator while hydrating and no lawyers yet
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
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialIcons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.filterIconButton}>
            <MaterialIcons name="filter-list" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

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

      {/* Zomato-style filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterChipsScroll}
        contentContainerStyle={styles.filterChipsContainer}
      >
        <TouchableOpacity
          style={[
            styles.filterChip,
            filters.minRating >= 4 && styles.filterChipActive
          ]}
          onPress={() => setFilters(prev => ({
            ...prev,
            minRating: prev.minRating >= 4 ? 0 : 4
          }))}
        >
          <MaterialIcons
            name="star"
            size={16}
            color={filters.minRating >= 4 ? "#4F46E5" : "#94A3B8"}
          />
          <Text style={[
            styles.filterChipText,
            filters.minRating >= 4 && styles.filterChipTextActive
          ]}>
            Rating 4+
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            filters.priceSort === 'lowToHigh' && styles.filterChipActive
          ]}
          onPress={() => setFilters(prev => ({
            ...prev,
            priceSort: prev.priceSort === 'lowToHigh' ? 'none' : 'lowToHigh'
          }))}
        >
          <MaterialIcons
            name="arrow-upward"
            size={16}
            color={filters.priceSort === 'lowToHigh' ? "#4F46E5" : "#94A3B8"}
          />
          <Text style={[
            styles.filterChipText,
            filters.priceSort === 'lowToHigh' && styles.filterChipTextActive
          ]}>
            Price: Low to High
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            filters.priceSort === 'highToLow' && styles.filterChipActive
          ]}
          onPress={() => setFilters(prev => ({
            ...prev,
            priceSort: prev.priceSort === 'highToLow' ? 'none' : 'highToLow'
          }))}
        >
          <MaterialIcons
            name="arrow-downward"
            size={16}
            color={filters.priceSort === 'highToLow' ? "#4F46E5" : "#94A3B8"}
          />
          <Text style={[
            styles.filterChipText,
            filters.priceSort === 'highToLow' && styles.filterChipTextActive
          ]}>
            Price: High to Low
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            filters.onlineOnly && styles.filterChipActive
          ]}
          onPress={() => setFilters(prev => ({
            ...prev,
            onlineOnly: !prev.onlineOnly
          }))}
        >
          <MaterialIcons
            name="wifi"
            size={16}
            color={filters.onlineOnly ? "#4F46E5" : "#94A3B8"}
          />
          <Text style={[
            styles.filterChipText,
            filters.onlineOnly && styles.filterChipTextActive
          ]}>
            Online Only
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            filters.minExperience >= 5 && styles.filterChipActive
          ]}
          onPress={() => setFilters(prev => ({
            ...prev,
            minExperience: prev.minExperience >= 5 ? 0 : 5
          }))}
        >
          <MaterialIcons
            name="work"
            size={16}
            color={filters.minExperience >= 5 ? "#4F46E5" : "#94A3B8"}
          />
          <Text style={[
            styles.filterChipText,
            filters.minExperience >= 5 && styles.filterChipTextActive
          ]}>
            Exp 5+ Years
          </Text>
        </TouchableOpacity>

        {(filters.minRating > 0 || filters.priceSort !== 'none' || filters.onlineOnly || filters.minExperience > 0) && (
          <TouchableOpacity
            style={styles.filterChipClear}
            onPress={() => setFilters({
              minRating: 0,
              priceSort: 'none',
              onlineOnly: false,
              minExperience: 0,
            })}
          >
            <MaterialIcons name="close" size={16} color="#EF4444" />
            <Text style={styles.filterChipClearText}>
              Clear Filters
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.sectionsContainer}
      >
        {renderHorizontalSection('Recommended Lawyers', sectionData.recommendedLawyers)}
        {renderHorizontalSection('Your Lawyers', sectionData.yourLawyers)}
        {renderHorizontalSection('Recent Conversations', sectionData.recentConversations)}
        {renderHorizontalSection('Top Rated', sectionData.topRatedLawyers)}
        
        {/* Show filtered results when searching */}
        {searchQuery.trim() !== '' || activeCategory !== 'All' ||
         filters.minRating > 0 || filters.priceSort !== 'none' ||
         filters.onlineOnly || filters.minExperience > 0 ? (
          <View style={styles.filteredResultsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Search Results</Text>
              <Text style={styles.resultCount}>{filteredLawyers.length} lawyers</Text>
            </View>
            {filteredLawyers.length > 0 ? (
              <FlatList
                data={filteredLawyers}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                scrollEnabled={false}
                contentContainerStyle={styles.verticalListContent}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="search-off" size={64} color="#334155" />
                <Text style={styles.emptyText}>No lawyers found matching your criteria.</Text>
                <TouchableOpacity
                  style={styles.resetBtn}
                  onPress={() => {
                    setSearchQuery('');
                    setActiveCategory('All');
                    setFilters({
                      minRating: 0,
                      priceSort: 'none',
                      onlineOnly: false,
                      minExperience: 0,
                    });
                  }}
                >
                  <Text style={styles.resetBtnText}>Clear all filters</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#020617',
  },
  header: {
    padding: 16,
    gap: 16,
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
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
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
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
  },
  filterIconButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
  },
  filtersScroll: {
    marginBottom: 8,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryChipActive: {
    backgroundColor: '#4F46E520',
    borderColor: '#4F46E5',
  },
  categoryText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#4F46E5',
  },
  // Filter chips styles
  filterChipsScroll: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  filterChipsContainer: {
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 6,
    flexShrink: 0,
  },
  filterChipActive: {
    backgroundColor: '#4F46E520',
    borderColor: '#4F46E5',
  },
  filterChipText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#4F46E5',
  },
  filterChipClear: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#EF4444',
    gap: 6,
  },
  filterChipClearText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
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
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    gap: 16,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  resetBtn: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#4F46E5',
  },
  resetBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  // Section styles
  sectionsContainer: {
    paddingBottom: 100,
  },
  sectionContainer: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  sectionSeeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  resultCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  horizontalListContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  verticalListContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  filteredResultsSection: {
    marginTop: 32,
    marginBottom: 40,
  },
});
