import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../../constants/colors';
import {
  getLegalCategory,
  getLegalSubCategory,
  parseCombinableRef,
  resolveCombinableTitle,
} from '../../../src/data/legalCategories';
import { generateLegalResponse } from '../../../src/services/legalResponseEngine';

function mapLawyerCategoryToCaseCategory(
  lc: string | undefined,
): 'matrimonial' | 'employment' | 'criminal' | 'property' | 'civil' {
  switch (lc) {
    case 'family':
      return 'matrimonial';
    case 'employment':
      return 'employment';
    case 'criminal':
      return 'criminal';
    case 'property':
      return 'property';
    default:
      return 'civil';
  }
}

export default function LegalDetailScreen() {
  const router = useRouter();
  const { categoryId, subId } = useLocalSearchParams<{ categoryId: string; subId: string }>();
  const category = getLegalCategory(String(categoryId ?? ''));
  const sub = getLegalSubCategory(String(categoryId ?? ''), String(subId ?? ''));
  const [query, setQuery] = useState('');

  const smartQuery = useMemo(() => query.trim() || sub?.title || '', [query, sub?.title]);

  if (!category || !sub) {
    return (
      <View style={s.root}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.bgPrimary }} />
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn} hitSlop={10}>
            <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Legal Detail</Text>
          <View style={{ width: 32 }} />
        </View>
        <View style={s.emptyWrap}>
          <Text style={s.emptyTxt}>Detail not found.</Text>
        </View>
      </View>
    );
  }

  const handleSmartSearch = (rawQuery: string) => {
    const q = rawQuery.trim();
    if (!q) return;
    const legalResponse = generateLegalResponse(q);
    router.push({
      pathname: '/smart-legal-search',
      params: { q, ai: JSON.stringify(legalResponse) },
    } as never);
  };

  const caseCategory = mapLawyerCategoryToCaseCategory(category.lawyerCategory);

  return (
    <View style={s.root}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.bgPrimary }} />
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} hitSlop={10}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{sub.title}</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Section 1 */}
        <Text style={s.h2}>Summary</Text>
        <View style={s.card}>
          <Text style={s.title}>{sub.title}</Text>
          <Text style={s.subDesc}>{sub.description}</Text>
          <Text style={s.body}>{sub.explanation}</Text>
        </View>

        {/* Section 2 */}
        <Text style={s.h2}>What you can do</Text>
        <View style={s.card}>
          {sub.steps.map((step, i) => (
            <View key={`${i}-${step}`} style={s.stepRow}>
              <View style={s.stepBubble}>
                <Text style={s.stepNum}>{i + 1}</Text>
              </View>
              <Text style={s.stepTxt}>{step}</Text>
            </View>
          ))}
        </View>

        {/* Section 3 */}
        <Text style={s.h2}>Applicable laws</Text>
        <View style={s.card}>
          {sub.laws.map((law) => (
            <View key={law} style={s.row}>
              <MaterialIcons name="gavel" size={14} color={category.color} />
              <Text style={s.rowTxt}>{law}</Text>
            </View>
          ))}
        </View>

        {/* Section 4 */}
        <Text style={s.h2}>Timeline & cost</Text>
        <View style={s.card}>
          <Text style={s.metaLabel}>Typical timeline</Text>
          <Text style={s.metaVal}>{sub.timeline}</Text>
          <View style={s.divider} />
          <Text style={s.metaLabel}>Cost estimate (indicative)</Text>
          <Text style={s.metaVal}>{sub.costEstimate}</Text>
        </View>

        {/* Section 5 */}
        <Text style={s.h2}>Related cases / patterns</Text>
        <View style={s.card}>
          {sub.relatedCases.map((c) => (
            <View key={c} style={s.bulletRow}>
              <Text style={s.bullet}>•</Text>
              <Text style={s.bulletTxt}>{c}</Text>
            </View>
          ))}
        </View>

        {/* Section 6 */}
        <Text style={s.h2}>Case combination suggestions</Text>
        <View style={s.card}>
          {sub.combinableWith.length === 0 ? (
            <Text style={s.muted}>No cross-links for this topic yet.</Text>
          ) : (
            sub.combinableWith.map((ref) => {
              const parsed = parseCombinableRef(ref);
              const label = resolveCombinableTitle(ref);
              return (
                <TouchableOpacity
                  key={ref}
                  style={s.linkChip}
                  onPress={() =>
                    parsed &&
                    router.push({
                      pathname: '/legal-detail/[categoryId]/[subId]',
                      params: { categoryId: parsed.categoryId, subId: parsed.subId },
                    })
                  }
                  activeOpacity={0.85}
                  disabled={!parsed}
                >
                  <MaterialIcons name="link" size={14} color={category.color} />
                  <Text style={s.linkChipTxt}>{label}</Text>
                  <MaterialIcons name="chevron-right" size={16} color={Colors.textTertiary} />
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Action panel */}
        <Text style={s.h2}>Actions</Text>
        <View style={s.card}>
          <View style={s.ctaRow}>
            <TouchableOpacity
              style={s.ctaBtn}
              onPress={() => router.push({ pathname: '/nyaya', params: { query: smartQuery } })}
              activeOpacity={0.85}
            >
              <MaterialIcons name="psychology" size={14} color="#fff" />
              <Text style={s.ctaTxt}>Ask AI</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.ctaBtn}
              onPress={() =>
                router.push({ pathname: '/(tabs)/lawyers', params: { category: category.lawyerCategory } })
              }
              activeOpacity={0.85}
            >
              <MaterialIcons name="person" size={14} color="#fff" />
              <Text style={s.ctaTxt}>Talk to Lawyer</Text>
            </TouchableOpacity>
          </View>
          <View style={s.ctaRow}>
            <TouchableOpacity style={s.ctaBtn} onPress={() => router.push('/nyaya-notice')} activeOpacity={0.85}>
              <MaterialIcons name="description" size={14} color="#fff" />
              <Text style={s.ctaTxt}>Generate Notice</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.ctaBtn}
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/cases',
                  params: {
                    openNew: '1',
                    category: caseCategory,
                    source: 'subcategory',
                  },
                })
              }
              activeOpacity={0.85}
            >
              <MaterialIcons name="gavel" size={14} color="#fff" />
              <Text style={s.ctaTxt}>Start Case</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Smart input */}
        <View style={s.card}>
          <Text style={s.sectionLabel}>Not sure? Describe your issue</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Describe facts briefly — we'll suggest next steps"
            placeholderTextColor={Colors.textTertiary}
            style={s.input}
            multiline
          />
          <TouchableOpacity style={s.searchBtn} onPress={() => handleSmartSearch(smartQuery)} activeOpacity={0.85}>
            <MaterialIcons name="search" size={16} color="#fff" />
            <Text style={s.searchTxt}> Search</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgPrimary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  backBtn: { width: 32, padding: 4 },
  headerTitle: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, flex: 1, textAlign: 'center' },
  content: { padding: 16, gap: 6, paddingBottom: 110 },
  h2: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 6,
    marginBottom: 4,
  },
  sectionLabel: { fontSize: 11, color: Colors.textTertiary, fontWeight: '700', marginBottom: 8 },
  card: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
  },
  title: { fontSize: 15, color: Colors.textPrimary, fontWeight: '800' },
  subDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  body: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20, marginTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  rowTxt: { color: Colors.textPrimary, fontSize: 13, flex: 1 },
  stepRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginTop: 8 },
  stepBubble: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.primarySubtle, alignItems: 'center', justifyContent: 'center' },
  stepNum: { fontSize: 11, color: Colors.primary, fontWeight: '800' },
  stepTxt: { flex: 1, color: Colors.textPrimary, fontSize: 13, lineHeight: 19 },
  metaLabel: { fontSize: 11, color: Colors.textTertiary, fontWeight: '700' },
  metaVal: { fontSize: 13, color: Colors.textPrimary, marginTop: 4, lineHeight: 19 },
  divider: { height: 1, backgroundColor: Colors.borderSubtle, marginVertical: 10 },
  bulletRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  bullet: { color: Colors.textSecondary, marginTop: 1 },
  bulletTxt: { flex: 1, fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },
  muted: { fontSize: 12, color: Colors.textTertiary },
  linkChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  linkChipTxt: { flex: 1, fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  ctaRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  ctaBtn: {
    flex: 1,
    minWidth: '44%',
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  ctaTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  input: {
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    color: Colors.textPrimary,
    fontSize: 13,
  },
  searchBtn: {
    marginTop: 10,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    height: 40,
  },
  searchTxt: { color: '#fff', fontWeight: '700', fontSize: 13 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyTxt: { fontSize: 13, color: Colors.textSecondary },
});
