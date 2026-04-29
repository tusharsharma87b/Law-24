import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { getLegalSystemCategory, type Item } from '../../src/data/legalSystem';
import { analyzeLegalItem, smartSearchParams } from '../../src/services/smartLegalSearchService';

export default function LegalSystemCategoryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const category = typeof id === 'string' ? getLegalSystemCategory(id) : undefined;
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);

  const handleSmartSearch = async (item: Item) => {
    if (!category) return;
    try {
      setLoadingItemId(item.id);
      const ai = await analyzeLegalItem(item, category);
      router.push({
        pathname: '/smart-legal-search',
        params: smartSearchParams(item, category, ai),
      } as any);
    } finally {
      setLoadingItemId(null);
    }
  };

  if (!category) {
    return (
      <View style={s.root}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.bgPrimary }} />
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn} hitSlop={10}>
            <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Legal Category</Text>
          <View style={{ width: 32 }} />
        </View>
        <View style={s.emptyWrap}>
          <Text style={s.emptyTitle}>Category not found</Text>
          <Text style={s.emptySub}>Please go back and choose another category.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.bgPrimary }} />
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} hitSlop={10}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{category.title}</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.subTitle}>Choose the issue closest to your situation.</Text>
        {category.items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={s.itemCard}
            onPress={() => handleSmartSearch(item)}
            disabled={loadingItemId === item.id}
            activeOpacity={0.88}
          >
            <View style={{ flex: 1 }}>
              <Text style={s.itemTitle}>{item.title}</Text>
              <Text style={s.itemDesc} numberOfLines={2}>{item.description}</Text>
            </View>
            {loadingItemId === item.id ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <MaterialIcons name="chevron-right" size={22} color={Colors.textTertiary} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgPrimary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle,
  },
  backBtn: { width: 32, padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  content: { padding: 16, paddingBottom: 110, gap: 10 },
  subTitle: { color: Colors.textSecondary, fontSize: 13, lineHeight: 20, marginBottom: 4 },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.bgSecondary,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
  },
  itemTitle: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  itemDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 4, lineHeight: 18 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 8 },
  emptyTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '800' },
  emptySub: { color: Colors.textSecondary, fontSize: 13, textAlign: 'center' },
});
