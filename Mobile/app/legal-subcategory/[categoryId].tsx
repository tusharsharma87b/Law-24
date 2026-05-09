import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { getLegalCategory } from '../../src/data/legalCategories';
import type { LegalSubCategory } from '../../src/data/legalCategories';

export default function LegalSubCategoryScreen() {
  const router = useRouter();
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const category = getLegalCategory(String(categoryId ?? ''));

  if (!category) {
    return (
      <View style={s.root}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.bgPrimary }} />
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn} hitSlop={10}>
            <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Subcategories</Text>
          <View style={{ width: 32 }} />
        </View>
        <View style={s.emptyWrap}>
          <Text style={s.emptyTxt}>Category not found.</Text>
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
        <Text style={s.headerTitle}>{category.category}</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {category.subcategories.map((sub: LegalSubCategory) => (
          <TouchableOpacity
            key={sub.id}
            style={s.subCard}
            onPress={() => router.push({ pathname: '/legal-detail/[categoryId]/[subId]', params: { categoryId: category.id, subId: sub.id } })}
            activeOpacity={0.88}
          >
            <View style={[s.subIcon, { backgroundColor: category.color + '1A' }]}>
              <MaterialIcons name="description" size={18} color={category.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.subTitle}>{sub.title}</Text>
              <Text style={s.subDesc}>{sub.description}</Text>
              {sub.timeline ? (
                <Text style={s.subMeta} numberOfLines={1}>
                  {sub.timeline}
                </Text>
              ) : null}
            </View>
            <MaterialIcons name="chevron-right" size={18} color={category.color} />
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
  content: { padding: 16, gap: 10, paddingBottom: 110 },
  subCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.bgSecondary, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border, padding: 12,
  },
  subIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  subTitle: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  subDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 2, lineHeight: 18 },
  subMeta: { fontSize: 11, color: Colors.textTertiary, marginTop: 4, lineHeight: 15 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyTxt: { fontSize: 13, color: Colors.textSecondary },
});
