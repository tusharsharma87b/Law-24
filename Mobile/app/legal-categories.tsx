import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { LEGAL_SYSTEM } from '../src/data/legalSystem';

const CATEGORY_COLORS: Record<string, string> = {
  'criminal-law': '#F85149',
  'family-law': '#FF9F43',
  'labour-law': '#58A6FF',
  'property-law': '#3FB950',
  'civil-law': '#F5A623',
  'corporate-law': '#A78BFA',
  'consumer-law': '#22C55E',
  'cyber-law': '#60A5FA',
  'legal-services': '#F5A623',
  'legal-utilities': '#34D399',
};

export default function LegalCategoriesScreen() {
  const router = useRouter();

  return (
    <View style={s.root}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.bgPrimary }} />
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} hitSlop={10}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Legal Categories</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.subTitle}>Explore legal areas and choose the one closest to your issue.</Text>

        <View style={s.grid}>
          {LEGAL_SYSTEM.map((cat) => {
            const color = CATEGORY_COLORS[cat.id] ?? Colors.primary;
            return (
            <TouchableOpacity
              key={cat.id}
              style={[s.card, { borderColor: color + '40' }]}
              onPress={() => router.push({ pathname: '/categories/[id]', params: { id: cat.id } } as any)}
              activeOpacity={0.88}
            >
              <View style={[s.iconWrap, { backgroundColor: color + '1A' }]}>
                <MaterialIcons name={cat.icon as any} size={22} color={color} />
              </View>
              <Text style={s.cardTitle}>{cat.title}</Text>
              <Text style={s.cardMeta}>{cat.items.length} legal topics</Text>
            </TouchableOpacity>
            );
          })}
        </View>
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
  content: { padding: 16, paddingBottom: 110 },
  subTitle: { color: Colors.textSecondary, fontSize: 13, lineHeight: 20, marginBottom: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    width: '47%', minWidth: 145, flexGrow: 1,
    backgroundColor: Colors.bgSecondary, borderRadius: 14, borderWidth: 1,
    padding: 14, gap: 8,
  },
  iconWrap: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  cardMeta: { fontSize: 11, color: Colors.textSecondary },
});
